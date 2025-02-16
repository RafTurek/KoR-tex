from datetime import datetime
import os
import random
import re  # Add at the top of the file if not already imported

from models import db, Task, Project
from backend.inference import LLMInference


# Local ChatMessage class for chat history management
class ChatMessage:
    def __init__(self, role: str, content: str, timestamp: datetime = None):
        self.role = role
        self.content = content
        self.timestamp = timestamp if timestamp is not None else datetime.now()

    def to_dict(self):
        return {
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat()
        }


class ChatManager:
    def __init__(self):
        # For managing chat tasks and history
        self.chat_histories = {}
        self.max_history = 10

        # LLM instance for chat responses
        self.llm = LLMInference(api_key=os.environ.get("DEEPSEEK_API_KEY"))
        self.fallback_responses = {
            'greeting': [
                "Hi! How can I help?",
                "Hello! What can I do for you?",
                "Good day! How may I assist you?"
            ],
            'default': [
                "I understand. What next?",
                "How can I help?",
                "Please let me know what you need."
            ]
        }
        # Flag to ensure tools are declared to LLM on first connection
        self.tools_declared = False

    def declare_tools(self) -> None:
        tools_message = (
            "[Tool Declaration]\n"
            "Available Tools:\n"
            "- add_task: Use this tool to add a new task to the system.\n"
            "  Command usage: 'ADD TASK:' or 'DODAJ ZADANIE:' followed by the task description.\n"
        )
        print("[LLM] Declaring available tools to LLM:")
        print(tools_message)
        self.tools_declared = True

    def generate_task_content_with_LLM(self, prompt: str) -> str:
        """
        Generate task content using LLM based on the provided prompt.
        For demonstration, returns a simulated task content string.
        """
        print("[LLM] Generating task content using available tool 'add_task' with prompt:", prompt)
        return f"Generated task based on prompt: '{prompt}'"

    def add_task(self, prompt: str) -> bool:
        """
        Add a task to the database by generating its content using LLM.
        Finds or creates a default project with tag '#inbox' and associates the new task with it.
        """
        print("[DEBUG] add_task tool invoked with prompt:", prompt)
        # Generate task content using LLM simulation
        task_content = self.generate_task_content_with_LLM(prompt)
        print(f"Task to add: {task_content}")
        try:
            # Find the default project with tag '#inbox'
            project = Project.query.filter_by(tag="#inbox").first()
            if not project:
                project = Project(tag="#inbox", name="Inbox")
                db.session.add(project)
                db.session.commit()
            
            # Create a new Task record with generated content
            new_task = Task(
                content=task_content,
                project_id=project.id
            )
            db.session.add(new_task)
            db.session.commit()
            print("Task successfully added to the database.")
            return True
        except Exception as e:
            print(f"Error adding task: {e}")
            db.session.rollback()
            return False

    def process_llm_response(self, llm_response: str) -> None:
        """
        Process the LLM response to detect a command for adding a task.
        Looks for the keyword 'ADD TASK:' or 'DODAJ ZADANIE:' and extracts the prompt for task generation.
        If the command is found, calls add_task to add the task to the system.
        """
        upper_response = llm_response.upper()
        if "ADD TASK:" in upper_response or "DODAJ ZADANIE:" in upper_response:
            print("[LLM] Detected potential add_task command in LLM response.")
            if "ADD TASK:" in upper_response:
                parts = llm_response.split("ADD TASK:")
            else:
                parts = llm_response.split("DODAJ ZADANIE:")
            if len(parts) > 1:
                prompt = parts[1].strip()
                print("[LLM] User used request to add a new task. Forwarding to 'add_task' tool with prompt:", prompt)
                if self.add_task(prompt):
                    print("LLM successfully added the task.")
                else:
                    print("LLM failed to add the task.")
            else:
                print("No task prompt found in LLM response.")
        else:
            print("No add-task command detected in LLM response.")

    # Chat functionality methods
    def get_chat_history(self, session_id: str) -> list:
        """
        Return the chat history for the given session as a list of dicts.
        """
        history = self.chat_histories.get(session_id, [])
        return [msg.to_dict() for msg in history]

    def clear_chat_history(self, session_id: str) -> None:
        """
        Clear the chat history for the given session.
        """
        if session_id in self.chat_histories:
            del self.chat_histories[session_id]

    def filter_tool_command(self, response: str) -> str:
        """
        Filters out the tool command from the LLM response.
        If the response contains the [add_task] command in the format:
            [add_task]: "task content"
        then extracts the task content, calls add_task, and returns a cleaned message.
        If no tool command is found, returns the original response.
        """
        match = re.search(r'\[add_task\]:\s*"([^"]+)"', response, re.IGNORECASE)
        if match:
            task_text = match.group(1).strip()
            if not task_text:
                print("[ERROR] No task content provided in the add_task command.")
                return "Nie podano treści zadania."
            print("[FILTER] Detected add_task command with task content:", task_text)
            if self.add_task(task_text):
                return "Zadanie zostało dodane."
            else:
                return "Błąd przy dodawaniu zadania."
        else:
            return response

    def generate_response(self, prompt: str, session_id: str, context: dict = None) -> str:
        """
        Generate a response using the LLM model and update the chat history.
        Returns the generated response, after filtering out any internal tool commands.
        """
        if not self.tools_declared:
            self.declare_tools()
        try:
            history = self.chat_histories.get(session_id, [])
            history_dicts = [msg.to_dict() for msg in history]
            if self.llm and self.llm.model is not None:
                response = self.llm.generate_response(prompt, history_dicts, context)
            else:
                if any(word in prompt.lower() for word in ['hi', 'hello']):
                    response = random.choice(self.fallback_responses['greeting'])
                else:
                    response = random.choice(self.fallback_responses['default'])
            
            # Filter out any tool commands from the response
            response_to_show = self.filter_tool_command(response)
            
            # Append messages to history (store user's original prompt and the filtered response)
            history.append(ChatMessage("user", prompt))
            history.append(ChatMessage("assistant", response_to_show))
            self.chat_histories[session_id] = history[-self.max_history:]
            return response_to_show
        except Exception as e:
            print(f"Error generating response: {e}")
            if any(word in prompt.lower() for word in ['hi', 'hello']):
                return random.choice(self.fallback_responses['greeting'])
            return random.choice(self.fallback_responses['default']) 
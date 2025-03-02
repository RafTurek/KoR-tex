from openai import OpenAI
from typing import List, Dict, Optional
from datetime import datetime
import os

class LLMInference:
    MODELS = {
        "chat": {
            "name": "deepseek-chat",
            "description": "DeepSeek-V3 - Model konwersacyjny"
        },
        "reasoner": {
            "name": "deepseek-reasoner",
            "description": "DeepSeek-R1 - Model rozumowania"
        }
    }

    def __init__(self, api_key: str, model_type: str = "chat"):
        self.client = OpenAI(
            api_key=os.environ.get("DEEPSEEK_API_KEY"),
            base_url="https://api.deepseek.com/v1"
        )
        self.model_type = model_type
        self.model = self.MODELS[model_type]["name"]
        
        # Domyślne ustawienia
        self.temperature = 0.7
        self.max_tokens = 512
        self.top_p = 0.9
        self.frequency_penalty = 0.0
        self.presence_penalty = 0.0
        
        # Ustawienia personalizacji
        self.user_identity = ""
        self.short_term_plans = ""
        self.long_term_plans = ""
        self.response_tone = ""
        self.response_length = ""
        self.llm_focus_type = ""
        self.llm_subject_area = ""
        
        # Inicjalizacja promptu systemowego na końcu
        self.system_prompt = self._get_system_prompt()
    
    def _get_system_prompt(self) -> str:
        """Returns the appropriate system prompt based on the model and settings."""
        base_prompt = ""
        if self.model_type == "chat":
            base_prompt = ("Jesteś pomocnym asystentem. Odpowiadasz w języku polskim w sposób zwięzły i na temat. Pamiętasz o kontekście rozmowy.\n\n"
                           "Dostępne narzędzia:\n"
                           "[add_task]: Użyj tego narzędzia, aby dodać nowe zadanie. Formatuj polecenie jako: [add_task]: \"treść zadania\".\n"
                           "Przykład: Jeśli chcesz dodać zadanie 'kupić mleko', odpowiedz: [add_task]: \"kupić mleko\".")
        else:
            base_prompt = (
                "Jesteś pomocnym asystentem specjalizującym się w rozumieniu i rozwiązywaniu problemów. "
                "Zawsze odpowiadasz w języku polskim, krok po kroku wyjaśniając swój tok myślenia.\n\n"
                "Dla każdego problemu:\n"
                "1. **Analiza:** Najpierw analizujesz i opisujesz problem.\n"
                "2. **Dekompozycja:** Rozkładasz go na mniejsze części.\n"
                "3. **Rozwiązanie:** Rozwiązujesz każdą część osobno.\n"
                "4. **Synteza:** Łączysz rozwiązania w całość.\n"
                "5. **Weryfikacja:** Sprawdzasz poprawność i podsumowujesz."
            )
        # Add personalization if set
        personalizations = []
        if self.user_identity:
            personalizations.append(f"Tożsamość użytkownika: {self.user_identity}")
        if self.short_term_plans:
            personalizations.append(f"Krótkoterminowe plany: {self.short_term_plans}")
        if self.long_term_plans:
            personalizations.append(f"Długoterminowe plany: {self.long_term_plans}")
        if self.response_tone:
            personalizations.append(f"Ton odpowiedzi: {self.response_tone}")
        if self.response_length:
            personalizations.append(f"Długość odpowiedzi: {self.response_length}")
        if self.llm_focus_type:
            personalizations.append(f"Typ skupienia: {self.llm_focus_type}")
        if self.llm_subject_area:
            personalizations.append(f"Obszar tematyczny: {self.llm_subject_area}")
        
        if personalizations:
            base_prompt += "\n\nUstawienia personalizacji:\n" + "\n".join(personalizations)
        
        return base_prompt

    def switch_model(self, model_type: str) -> bool:
        """Przełącza model na inny typ"""
        if model_type not in self.MODELS:
            return False
        self.model_type = model_type
        self.model = self.MODELS[model_type]["name"]
        self.system_prompt = self._get_system_prompt()
        return True

    def get_available_models(self) -> Dict[str, Dict[str, str]]:
        """Zwraca listę dostępnych modeli"""
        return self.MODELS
    
    def initialize(self):
        """Initialize the OpenAI client"""
        try:
            # Test connection with a simple request
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": "Test connection"}
                ],
                max_tokens=10,
                stream=False
            )
            print("Model DeepSeek zainicjalizowany pomyślnie")
            return True
        except Exception as e:
            print(f"Błąd inicjalizacji modelu: {str(e)}")
            return False
    
    def format_history(self, history: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Formatuje historię rozmowy w format OpenAI"""
        messages = [{"role": "system", "content": self.system_prompt}]
        if history:
            for msg in history[-5:]:  # Ostatnie 5 wiadomości
                messages.append({
                    "role": "user" if msg['role'] == "user" else "assistant",
                    "content": msg['content']
                })
        return messages
    
    def generate_response(self, prompt: str, history=None, context=None) -> str:
        """Generate response using the model"""
        try:
            print(f"\n[LLM] Generowanie odpowiedzi dla: '{prompt[:50]}...'")
            
            # Przygotuj wiadomości z historią
            messages = self.format_history(history) if history else [
                {"role": "system", "content": self.system_prompt}
            ]
            
            # Dla modelu reasoner dodaj wskazówkę o strukturze odpowiedzi
            if self.model_type == "reasoner" and not any(word in prompt.lower() for word in ['cześć', 'hej', 'witaj']):
                prompt = f"""Proszę rozwiąż ten problem zgodnie z podaną strukturą:

{prompt}

Pamiętaj o użyciu nagłówków: ANALIZA, ROZWIĄZANIE (z krokami), PODSUMOWANIE."""
            
            messages.append({"role": "user", "content": prompt})
            
            print("[LLM] Wysyłanie zapytania do API...")
            start_time = datetime.now()
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                top_p=self.top_p,
                frequency_penalty=self.frequency_penalty,
                presence_penalty=self.presence_penalty,
                stream=False
            )
            
            generation_time = (datetime.now() - start_time).total_seconds()
            print(f"[LLM] Czas generowania: {generation_time:.2f}s")
            
            response_text = response.choices[0].message.content
            print(f"[LLM] Odpowiedź: '{response_text[:50]}...'\n")
            
            return response_text
            
        except Exception as e:
            print(f"[LLM] BŁĄD generowania odpowiedzi: {str(e)}")
            return "Przepraszam, wystąpił błąd podczas generowania odpowiedzi."

    def _format_prompt_with_context(self, prompt: str, context: dict) -> str:
        """Format prompt with additional context"""
        if context.get('type') == 'task':
            return f"""Utwórz zadanie:
Treść: {prompt}
Projekt: {context.get('project', '#inbox')}
Kategoria: {context.get('category', '')}
Priorytet: {context.get('priority', 'medium')}
Deadline: {context.get('deadline', '')}
"""
        else:
            return f"""Utwórz notatkę:
Treść: {prompt}
Projekt: {context.get('project', '#inbox')}
Kategoria: {context.get('category', '')}
"""

    def _format_with_history(self, prompt: str, history: list) -> str:
        """Format prompt with chat history"""
        formatted_history = ""
        for msg in history[-5:]:  # Use last 5 messages
            role = "User" if msg['role'] == 'user' else "Assistant"
            formatted_history += f"{role}: {msg['content']}\n"
        return f"{formatted_history}User: {prompt}\nAssistant:" 
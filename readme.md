# RAF_PAD - Task, Notes, and Ideas Pad

## Overview

RAF_PAD is a simple application designed to help you jot down tasks, notes, and ideas quickly and efficiently. It leverages an AI assistant to generate content and provides tools to organize your thoughts.

## Features

- **AI-Powered Content Generation:** Generate tasks, notes, and ideas using an integrated AI assistant.
- **Organization:**  Organize your tasks and notes with projects and categories.
- **Task Management:** Manage tasks with priorities, deadlines, and subtasks.
- **Note Taking:** Create and manage notes with categories and project tags.
- **Filtering:** Filter tasks and notes by project and category for better organization.
- **Chat Interface:**  Interact with the AI assistant directly through a chat interface.
- **Model Switching:** Choose between different AI models (e.g., chat and reasoning models).

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask
- **Database:** SQLite (Extensible to PostgreSQL, MySQL, MongoDB, Firebase, or Supabase)
- **Libraries:**
    - Langchain
    - Flask
    - SQLAlchemy
    - SQLite
    - OpenAI (DeepSeek API)

## Setup

To run RAF_PAD locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [repository_url]
    cd RAF_PAD
    ```

2.  **Set up a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up your DeepSeek API key:**
    - This project uses the DeepSeek API for AI features. You need to obtain an API key from [DeepSeek](https://api.deepseek.com/).
    - **Environment Variable:** Set your DeepSeek API key as an environment variable named `DEEPSEEK_API_KEY`.  For example, in your `.bashrc` or `.zshrc` file, add:
      ```bash
      export DEEPSEEK_API_KEY="your_deepseek_api_key_here"
      ```
      Alternatively, you can set it directly in your terminal session before running the app.

5.  **Initialize the database:**
    ```bash
    python init_db.py
    ```

6.  **Run the Flask application:**
    ```bash
    flask run
    ```
    The application will be accessible at `http://127.0.0.1:5000/`.

## Usage

- **Adding Tasks and Notes:** Use the input area at the top to add new tasks and notes. You can specify projects, categories, priorities, and deadlines.
- **Managing Tasks and Notes:** View and manage your tasks and notes in the respective containers below the input area. You can edit, delete, and mark tasks as complete.
- **AI Chat:**  Interact with the AI assistant in the chat interface to generate ideas, refine tasks, or get help with note-taking. Switch between different AI models using the model selector in the chat window.
- **Filtering:** Use the project and category filters in the task and note containers to organize and view specific items.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues to suggest improvements or report bugs.

## License

**Copyright (C) {{ current_year }} Rafał Turek. All rights reserved.**

This project is distributed under default copyright.

**RAF_PAD MVP - Free for Personal, Non-Commercial Use**

This version of RAF_PAD (MVP - Minimum Viable Product) is provided **free of charge** for **personal, non-commercial use**.  You are welcome to use it to manage your tasks, notes, and ideas for your own personal purposes.

**Key points for MVP:**

- **Free of Charge:** RAF_PAD MVP is completely free to use for personal purposes.
- **Non-Commercial Use Only:**  Commercial use, modification, or distribution is strictly prohibited.
- **Suggestions and Feedback Welcome:** Your feedback and suggestions are highly appreciated to improve RAF_PAD.
- **Future Commercial Version:** Please note that future versions of RAF_PAD (e.g., v2 or under a different name) are planned to be commercial products and will require a subscription.

**Future Commercial Product (e.g., RAF_PAD v2 or similar):**

Please be aware that this MVP is a preview of the core functionality.  Future, more feature-rich versions of RAF_PAD are planned to be commercial products offered under a subscription model.  Users who actively use the MVP and provide valuable feedback will be given priority access and potential discounts for the initial subscription period of the commercial version as a thank you for their early support.

**All rights, including copyright, are exclusively reserved to the copyright holder. Unauthorized commercial use, modification, or distribution of RAF_PAD MVP is prohibited.**

## Note on Language

As the developer is Polish, some initial comments or variable names might appear in Polish. However, the project aims to be fully in English, and all code, comments, and documentation will eventually be in English for better collaboration and clarity.

### LLM Models and Data Privacy in AI Chat

In the AI chat interface, we utilize advanced language models (LLMs) to generate responses and assist in creating tasks, notes, and ideas. Currently, in RAF_PAD MVP, we are using a model provided by **DeepSeek API**.

**Future Models and Personalization:**

In the future, we plan to expand the selection of available LLM models, allowing users to choose the model that best suits their needs.  Ultimately, we also aim to introduce AI assistant personalization mechanisms.  For this purpose, for users with accounts, we are considering the possibility of storing **only selected, non-personal configuration data** specific to a given user.  This may include preferences regarding the assistant's response style, types of tasks the user works on most frequently, or general topics of interest.

**User Data Privacy is a Priority:**

We want to **minimize the scope of stored data** and ensure **maximum privacy**.  Our goal is for the AI assistant to be as helpful as possible while **avoiding the collection and use of personal data**.  We plan to implement mechanisms that will enable the AI assistant itself to **recognize potentially sensitive information** in user interactions and **automatically exclude it from the memorization and personalization process**.

**We assure you that protecting user privacy is our priority.**  We do not intend to use personal data in any way.  The data that we potentially will store (only with user consent and full transparency) will be used **solely to improve the quality and personalization of the AI assistant's operation** within the RAF_PAD application.

**LLM Model Suggestions:**

If you have suggestions for specific LLM models that you think would be worth integrating with RAF_PAD, we would be happy to consider them!  We are currently testing and considering models such as:

*   **OpenAI Models:** (e.g., `gpt-4o`, `gpt-3.5-turbo`) - known for their high quality and versatility.
*   **Anthropic Models:** (e.g., `claude-3-sonnet`, `claude-3-opus`) - valued for their creativity and context understanding.
*   **Gemini Models:** (e.g., `gemini-pro`) - developed by Google, integrating various data modalities.
*   **DeepSeek Models:** (e.g., `deepseek-chat`) - used in MVP, offering good parameters in relation to costs.
*   **Local Models (Open Source):** (e.g., `Qwen2.5`, `Mistral`) - for users who prefer open-source solutions and greater control over data.

Your opinions and suggestions are very important to us and will help us further develop RAF_PAD and choose the best solutions for our users.

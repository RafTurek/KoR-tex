# Kortex - Task, Notes, and Ideas Management with AI

## Overview

Kortex is a productivity application designed to help you organize tasks, notes, and ideas efficiently. It leverages AI assistant capabilities to help generate content, provide suggestions, and optimize your workflow. The name "Kortex" references the cerebral cortex - the part of the brain responsible for higher cognitive functions like thinking, planning, and problem-solving.

## Features

- **Smart Task Management:** Create, organize, and track tasks with priorities, deadlines, and categories
- **Intelligent Note Taking:** Capture and organize notes with AI-assisted formatting and suggestion
- **Project Organization:** Group related tasks and notes into projects for better context
- **AI Assistance:** Generate ideas, get writing suggestions, and optimize your workflow with an integrated AI assistant
- **Filtering & Search:** Powerful search and filtering capabilities to find exactly what you need
- **Chat Interface:** Interact directly with the AI assistant to brainstorm or get help
- **Cross-Device Access:** Use Kortex on any device with a web browser

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask
- **Database:** PostgreSQL (with SQLite for development)
- **AI Integration:** Multiple LLM providers integration
- **Authentication:** OAuth and email/password

## Setup for Development

To run Kortex locally, follow these steps:

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/kortex.git
    cd kortex
    ```

2. **Set up a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4. **Set up environment variables:**
    Create a `.env` file in the root directory with the following variables:
    ```
    FLASK_APP=src/app.py
    FLASK_ENV=development
    DATABASE_URL=sqlite:///kortex.db
    SECRET_KEY=your_secret_key_here
    AI_API_KEY=your_ai_api_key_here
    ```

5. **Initialize the database:**
    ```bash
    flask db init
    flask db migrate
    flask db upgrade
    ```

6. **Run the Flask application:**
    ```bash
    flask run
    ```
    The application will be accessible at `http://127.0.0.1:5000/`.

## Project Structure

```
Kortex/
├── .env                    # Environment variables
├── requirements.txt        # Project dependencies
├── README.md               # Project documentation
├── src/                    # Source code
│   ├── __init__.py
│   ├── config/             # Configuration
│   │   ├── __init__.py
│   │   └── settings.py     # Project settings
│   ├── models/             # Data models
│   │   ├── __init__.py
│   │   ├── user.py         # User model
│   │   ├── task.py         # Task model
│   │   └── note.py         # Note model
│   ├── services/           # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py # Authentication
│   │   ├── task_service.py # Task operations
│   │   ├── note_service.py # Note operations
│   │   └── ai_service.py   # AI integration
│   ├── api/                # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── tasks.py
│   │   └── notes.py
│   ├── utils/              # Helper tools
│   │   ├── __init__.py
│   │   └── logger.py
│   ├── templates/          # Frontend templates
│   │   └── index.html
│   ├── static/             # Static files
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── app.py              # Main application file
└── tests/                  # Tests
    ├── __init__.py
    ├── test_tasks.py
    └── test_notes.py
```

## Using Kortex

- **Adding Tasks:** Create tasks with title, description, priority, deadline, and project/category tags
- **Managing Notes:** Create and organize notes with markdown support and AI assistance
- **AI Chat:** Use the AI assistant to brainstorm ideas, refine your tasks, or get help with writing
- **Organizing:** Use projects, categories, and tags to keep everything organized
- **Search:** Find what you need with powerful search across all your content

## Subscription Plans

Kortex offers three subscription tiers:

- **Free:** Basic task and note management, limited AI assistance
- **Pro ($15/month):** Advanced AI features, unlimited storage, integrations with third-party services
- **Team ($30/month):** Collaboration features, shared projects, team analytics

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues to suggest improvements or report bugs.

## License

**Copyright (C) 2025. All rights reserved.**

This project is distributed under proprietary license. The source code is provided for review and development purposes only.

Personal use of Kortex is permitted under the following conditions:
- You may use it for personal productivity management
- You may not redistribute, modify, or create derivative works
- You may not use it for commercial purposes without a paid subscription

## AI Models and Data Privacy

Kortex integrates with various AI models to provide assistance. We prioritize user privacy and security:

- We do not store the content of your conversations with the AI for training purposes
- All data is encrypted in transit and at rest
- Premium users can choose which AI models to use
- We may store minimal, non-personal configuration data to improve AI personalization

For more information about data handling and privacy, please refer to our Privacy Policy.
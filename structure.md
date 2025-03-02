Kortex/
├── .env                    # Zmienne środowiskowe
├── requirements.txt        # Zależności projektu
├── README.md               # Dokumentacja projektu
├── src/                    # Kod źródłowy
│   ├── __init__.py
│   ├── config/             # Konfiguracja
│   │   ├── __init__.py
│   │   └── settings.py     # Ustawienia projektu
│   ├── models/             # Modele danych
│   │   ├── __init__.py
│   │   ├── user.py         # Model użytkownika
│   │   ├── task.py         # Model zadania
│   │   └── note.py         # Model notatki
│   ├── services/           # Logika biznesowa
│   │   ├── __init__.py
│   │   ├── auth_service.py # Uwierzytelnianie
│   │   ├── task_service.py # Operacje na zadaniach
│   │   ├── note_service.py # Operacje na notatkach
│   │   └── ai_service.py   # Integracja z AI
│   ├── api/                # Endpointy API
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── tasks.py
│   │   └── notes.py
│   ├── utils/              # Narzędzia pomocnicze
│   │   ├── __init__.py
│   │   └── logger.py
│   ├── templates/          # Szablony frontend
│   ├── static/             # Pliki statyczne
│   └── app.py              # Główny plik aplikacji
└── tests/                  # Testy
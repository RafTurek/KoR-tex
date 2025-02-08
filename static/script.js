// Get the toggle button
const toggleButton = document.getElementById('toggle-theme-button');

// Add event listener for the button
toggleButton.addEventListener('click', () => {
    // Toggle the dark mode class on the body
    document.body.classList.toggle('dark-mode');

    // Toggle the icon based on the current mode
    const icon = toggleButton.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
});

// Funkcja do formatowania pojedynczego tagu projektowego

function formatProjectTag(input) {
    if (!input || input.trim() === '') {
        return '';  // Pusty string zamiast #Inbox
    }
    
    let cleanInput = input.replace(/[\s,]+/g, '');
    return cleanInput.startsWith('#') ? cleanInput : '#' + cleanInput;
}

// Pobierz referencje do elementów
const addTaskButton = document.getElementById('add-task-button');
const addNoteButton = document.getElementById('add-note-button');
const taskSettings = document.getElementById('task-settings');
const noteSettings = document.getElementById('note-settings');
const textarea = document.getElementById('add-element-textarea');
const subtasksContainer = document.getElementById('subtasks-container');

// Pobierz referencje do elementów podzadań
const subtasksList = document.getElementById('subtasks-list');

// Zmienna do śledzenia aktualnego typu elementu (note/task)
let currentElementType = null;

// Funkcja do przełączania na widok notatki
addNoteButton.addEventListener('click', () => {
    // Przełącz widoczność ustawień
    taskSettings.style.display = 'none';
    noteSettings.style.display = 'block';
    
    // Dostosuj textarea
    textarea.placeholder = 'Enter note content...';
    
    // Ukryj kontener podzadań
    subtasksContainer.style.display = 'none';
    
    // Zresetuj pola formularza notatki
    document.getElementById('note-project-tag').value = '';
    document.getElementById('note-category').value = '';
    currentElementType = 'note';
});

// Funkcja do przełączania na widok zadania
addTaskButton.addEventListener('click', () => {
    // Przełącz widoczność ustawień
    taskSettings.style.display = 'block';
    noteSettings.style.display = 'none';
    
    // Dostosuj textarea
    textarea.placeholder = 'Enter task description...';
    
    // Pokaż kontener podzadań
    subtasksContainer.style.display = 'block';
    
    // Zresetuj pola formularza zadania
    document.getElementById('task-project-tag').value = '';
    document.getElementById('task-category').value = '';
    document.getElementById('task-priority').value = '';
    document.getElementById('task-deadline').value = '';
    
    // Wyczyść listę podzadań
    subtasksList.innerHTML = '';
    currentElementType = 'task';
});

// Dodaj obsługę formatowania tagów projektu dla obu pól
['note-project-tag', 'task-project-tag'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {  // Sprawdź czy element istnieje
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            const formattedValue = formatProjectTag(value);
            e.target.value = formattedValue;
        });
    }
});

// Obsługa dodawania podzadań
const addSubtaskButton = document.getElementById('add-subtask-button');
const subtaskInput = document.getElementById('subtask-input');

addSubtaskButton.addEventListener('click', () => {
    const subtaskText = subtaskInput.value.trim();
    if (subtaskText) {
        addSubtask(subtaskText);
        subtaskInput.value = '';
    }
});

// Obsługa klawisza Enter w polu podzadań
subtaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const subtaskText = subtaskInput.value.trim();
        if (subtaskText) {
            addSubtask(subtaskText);
            subtaskInput.value = '';
        }
    }
});

// Funkcja do dodawania podzadania
function addSubtask(text) {
    const li = document.createElement('li');
    
    // Dodaj checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'subtask-checkbox';
    
    // Dodaj tekst podzadania
    const span = document.createElement('span');
    span.textContent = text;
    
    // Dodaj przycisk usuwania
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.className = 'subtask-delete-button';
    deleteButton.onclick = () => li.remove();
    
    // Połącz elementy
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteButton);
    
    subtasksList.appendChild(li);
}

// Obsługa przycisku Save
const saveElementButton = document.getElementById('save-element-button');

saveElementButton.addEventListener('click', async () => {
    if (!currentElementType) {
        alert('Please select element type (Note or Task) first');
        return;
    }

    // Pobierz zawartość
    const content = document.getElementById('add-element-textarea').value.trim();
    if (!content) {
        alert('Please enter content');
        return;
    }

    try {
        if (currentElementType === 'note') {
            await saveNote();
        } else {
            await saveTask();
        }
        
        // Wyczyść formularz po zapisie
        clearForm();
        
    } catch (error) {
        console.error('Error saving element:', error);
        alert('Error saving element. Please try again.');
    }
});

// Dodaj obsługę stanu ładowania i komunikatów
function showLoading(element) {
    element.classList.add('loading');
}

function hideLoading(element) {
    element.classList.remove('loading');
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

// Funkcja zapisująca notatkę
async function saveNote() {
    const saveButton = document.getElementById('save-element-button');
    showLoading(saveButton);
    try {
        const noteData = {
            content: document.getElementById('add-element-textarea').value,
            category: document.getElementById('note-category').value,
            project_tag: document.getElementById('note-project-tag').value || '#inbox'
        };

        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
        });

        if (!response.ok) {
            throw new Error('Failed to save note');
        }

        const result = await response.json();
        console.log('Note saved:', result);
        await loadElements();
        await loadProjectFilters();
        showMessage('Note saved successfully', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        hideLoading(saveButton);
    }
}

// Funkcja zapisująca zadanie
async function saveTask() {
    const taskData = {
        content: document.getElementById('add-element-textarea').value,
        category: document.getElementById('task-category').value,
        priority: document.getElementById('task-priority').value,
        deadline: document.getElementById('task-deadline').value,
        project_tag: document.getElementById('task-project-tag').value || '#inbox',
        subtasks: Array.from(document.getElementById('subtasks-list').children).map(li => ({
            content: li.querySelector('span').textContent,
            is_completed: li.querySelector('input[type="checkbox"]').checked
        }))
    };

    const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
    });

    if (!response.ok) {
        throw new Error('Failed to save task');
    }

    const result = await response.json();
    console.log('Task saved:', result);
    await loadElements();
    await loadProjectFilters();
}

// Funkcja czyszcząca formularz
function clearForm() {
    // Wyczyść textarea
    document.getElementById('add-element-textarea').value = '';
    
    // Wyczyść pola notatki
    document.getElementById('note-project-tag').value = '';
    document.getElementById('note-category').value = '';
    
    // Wyczyść pola zadania
    document.getElementById('task-project-tag').value = '';
    document.getElementById('task-category').value = '';
    document.getElementById('task-priority').value = '';
    document.getElementById('task-deadline').value = '';
    
    // Wyczyść listę podzadań
    document.getElementById('subtasks-list').innerHTML = '';
    
    // Ukryj wszystkie kontenery ustawień
    taskSettings.style.display = 'none';
    noteSettings.style.display = 'none';
    subtasksContainer.style.display = 'none';
    
    // Zresetuj typ elementu
    currentElementType = null;
}

// Dodaj infinite scroll
function setupInfiniteScroll() {
    const notesList = document.querySelector('.notes-list');
    notesList.addEventListener('scroll', async () => {
        if (notesList.scrollHeight - notesList.scrollTop === notesList.clientHeight) {
            currentPage++;
            const newElements = await loadElements(currentPage);
            displayElements(newElements);
        }
    });
}

// Wyświetlanie notatek
function displayNotes(notes) {
    const notesList = document.querySelector('.notes-list');
    const template = notesList.querySelector('.note-item.template');
    
    // Zachowaj template przed czyszczeniem
    const templateClone = template.cloneNode(true);
    notesList.innerHTML = ''; // Wyczyść listę
    notesList.appendChild(templateClone); // Przywróć template
    
    notes.forEach(note => {
        const noteElement = templateClone.cloneNode(true);
        noteElement.classList.remove('template');
        noteElement.style.display = 'block';
        
        // Wypełnij dane notatki
        noteElement.querySelector('.note-project-tag').textContent = note.project_tag;
        noteElement.querySelector('.note-category').textContent = note.category || '';
        noteElement.querySelector('.note-content').textContent = note.content;
        noteElement.querySelector('.note-date').textContent = new Date(note.created_at).toLocaleDateString();
        
        // Dodaj obsługę przycisków
        noteElement.querySelector('.edit-note').onclick = () => editNote(note.id);
        noteElement.querySelector('.delete-note').onclick = () => deleteNote(note.id);
        
        notesList.appendChild(noteElement);
    });
}

// Wyświetlanie zadań
function displayTasks(tasks) {
    const tasksList = document.querySelector('.tasks-list');
    const template = tasksList.querySelector('.task-item.template');
    
    // Zachowaj template przed czyszczeniem
    const templateClone = template.cloneNode(true);
    tasksList.innerHTML = ''; // Wyczyść listę
    tasksList.appendChild(templateClone); // Przywróć template
    
    tasks.forEach(task => {
        const taskElement = templateClone.cloneNode(true);
        taskElement.classList.remove('template');
        taskElement.style.display = 'block';
        
        // Wypełnij dane zadania
        taskElement.querySelector('.task-project-tag').textContent = task.project_tag;
        taskElement.querySelector('.task-priority').textContent = task.priority || '';
        taskElement.querySelector('.task-priority').classList.add(`priority-${task.priority}`);
        taskElement.querySelector('.task-deadline').textContent = task.deadline ? new Date(task.deadline).toLocaleDateString() : '';
        taskElement.querySelector('.task-content').textContent = task.content;
        taskElement.querySelector('.task-category').textContent = task.category || '';
        
        // Dodaj podzadania
        const subtasksList = taskElement.querySelector('.task-subtasks');
        task.subtasks?.forEach(subtask => {
            const subtaskItem = document.createElement('div');
            subtaskItem.className = 'subtask-item';
            subtaskItem.innerHTML = `
                <input type="checkbox" class="subtask-checkbox" ${subtask.is_completed ? 'checked' : ''}>
                <span>${subtask.content}</span>
            `;
            subtasksList.appendChild(subtaskItem);
        });
        
        // Dodaj obsługę przycisków
        taskElement.querySelector('.edit-task').onclick = () => editTask(task.id);
        taskElement.querySelector('.delete-task').onclick = () => deleteTask(task.id);
        
        tasksList.appendChild(taskElement);
    });
}

// Funkcje do edycji i usuwania
async function editNote(noteId) {
    try {
        const response = await fetch(`/api/notes/${noteId}`);
        const note = await response.json();
        
        const modalForm = document.getElementById('modal-form');
        modalForm.innerHTML = `
            <div class="form-group">
                <label for="edit-note-content">Content:</label>
                <textarea id="edit-note-content" class="input-field">${note.content}</textarea>
            </div>
            <div class="form-group">
                <label for="edit-note-project">Project:</label>
                <input type="text" id="edit-note-project" class="input-field" value="${note.project_tag}">
            </div>
            <div class="form-group">
                <label for="edit-note-category">Category:</label>
                <select id="edit-note-category" class="input-field">
                    <option value="">-- Select Category --</option>
                    <option value="work" ${note.category === 'work' ? 'selected' : ''}>Work</option>
                    <option value="personal" ${note.category === 'personal' ? 'selected' : ''}>Personal</option>
                    <option value="study" ${note.category === 'study' ? 'selected' : ''}>Study</option>
                </select>
            </div>
        `;
        
        document.getElementById('modal-title').textContent = 'Edit Note';
        modal.style.display = 'block';
        
        modalSave.onclick = async () => {
            const updatedNote = {
                content: document.getElementById('edit-note-content').value,
                project_tag: document.getElementById('edit-note-project').value,
                category: document.getElementById('edit-note-category').value
            };
            
            await updateNote(noteId, updatedNote);
            modal.style.display = 'none';
            await loadElements();
        };
    } catch (error) {
        console.error('Error editing note:', error);
    }
}

async function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        try {
            await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
            loadElements(); // Odśwież listę
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    }
}

async function editTask(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`);
        const task = await response.json();
        
        const modalForm = document.getElementById('modal-form');
        modalForm.innerHTML = `
            <div class="form-group">
                <label for="edit-task-content">Content:</label>
                <textarea id="edit-task-content" class="input-field">${task.content}</textarea>
            </div>
            <div class="form-group">
                <label for="edit-task-project">Project:</label>
                <input type="text" id="edit-task-project" class="input-field" value="${task.project_tag}">
            </div>
            <div class="form-group">
                <label for="edit-task-category">Category:</label>
                <select id="edit-task-category" class="input-field">
                    <option value="">-- Select Category --</option>
                    <option value="work" ${task.category === 'work' ? 'selected' : ''}>Work</option>
                    <option value="personal" ${task.category === 'personal' ? 'selected' : ''}>Personal</option>
                    <option value="study" ${task.category === 'study' ? 'selected' : ''}>Study</option>
                </select>
            </div>
            <div class="form-group">
                <label for="edit-task-priority">Priority:</label>
                <select id="edit-task-priority" class="input-field">
                    <option value="">-- Select Priority --</option>
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>
            <div class="form-group">
                <label for="edit-task-deadline">Deadline:</label>
                <input type="date" id="edit-task-deadline" class="input-field" value="${task.deadline?.split('T')[0] || ''}">
            </div>
        `;
        
        document.getElementById('modal-title').textContent = 'Edit Task';
        modal.style.display = 'block';
        
        modalSave.onclick = async () => {
            const updatedTask = {
                content: document.getElementById('edit-task-content').value,
                project_tag: document.getElementById('edit-task-project').value,
                category: document.getElementById('edit-task-category').value,
                priority: document.getElementById('edit-task-priority').value,
                deadline: document.getElementById('edit-task-deadline').value
            };
            
            await updateTask(taskId, updatedTask);
            modal.style.display = 'none';
            await loadElements();
        };
    } catch (error) {
        console.error('Error editing task:', error);
    }
}

async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
            loadElements(); // Odśwież listę
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }
}

// Funkcja do ładowania projektów do filtrów
async function loadProjectFilters() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        
        const filterSelects = document.querySelectorAll('.filter-project');
        filterSelects.forEach(select => {
            const currentValue = select.value; // Zachowaj aktualnie wybraną wartość
            select.innerHTML = '<option value="">All Projects</option>';
            projects.forEach(project => {
                select.innerHTML += `<option value="${project.tag}">${project.tag}</option>`;
            });
            select.value = currentValue; // Przywróć wybraną wartość
        });
    } catch (error) {
        console.error('Error loading project filters:', error);
    }
}

// Obsługa filtrowania
function setupFilters() {
    // Filtrowanie notatek
    const noteProjectFilter = document.getElementById('note-filter-project');
    const noteCategoryFilter = document.getElementById('note-filter-category');
    
    [noteProjectFilter, noteCategoryFilter].forEach(filter => {
        filter.addEventListener('change', () => {
            const projectTag = noteProjectFilter.value;
            const category = noteCategoryFilter.value;
            filterNotes(projectTag, category);
        });
    });
    
    // Filtrowanie zadań
    const taskProjectFilter = document.getElementById('task-filter-project');
    const taskCategoryFilter = document.getElementById('task-filter-category');
    
    [taskProjectFilter, taskCategoryFilter].forEach(filter => {
        filter.addEventListener('change', () => {
            const projectTag = taskProjectFilter.value;
            const category = taskCategoryFilter.value;
            filterTasks(projectTag, category);
        });
    });
}

// Modal do edycji
const modal = document.getElementById('edit-modal');
const closeModal = document.querySelector('.close-modal');
const modalSave = document.getElementById('modal-save');

closeModal.onclick = () => modal.style.display = 'none';
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Inicjalizacja przy starcie
document.addEventListener('DOMContentLoaded', () => {
    loadElements();
    loadProjectFilters();
    setupFilters();
});

// Funkcje do aktualizacji
async function updateNote(noteId, updatedData) {
    const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
        throw new Error('Failed to update note');
    }

    return await response.json();
}

async function updateTask(taskId, updatedData) {
    const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
        throw new Error('Failed to update task');
    }

    return await response.json();
}

// Funkcja do filtrowania notatek
function filterNotes(projectTag, category) {
    const notesList = document.querySelector('.notes-list');
    const notes = notesList.querySelectorAll('.note-item:not(.template)');
    
    notes.forEach(note => {
        const noteProjectTag = note.querySelector('.note-project-tag').textContent;
        const noteCategory = note.querySelector('.note-category').textContent;
        
        const projectMatch = !projectTag || noteProjectTag === projectTag;
        const categoryMatch = !category || noteCategory === category;
        
        note.style.display = projectMatch && categoryMatch ? 'block' : 'none';
    });
}

// Funkcja do filtrowania zadań
function filterTasks(projectTag, category) {
    const tasksList = document.querySelector('.tasks-list');
    const tasks = tasksList.querySelectorAll('.task-item:not(.template)');
    
    tasks.forEach(task => {
        const taskProjectTag = task.querySelector('.task-project-tag').textContent;
        const taskCategory = task.querySelector('.task-category').textContent;
        
        const projectMatch = !projectTag || taskProjectTag === projectTag;
        const categoryMatch = !category || taskCategory === category;
        
        task.style.display = projectMatch && categoryMatch ? 'block' : 'none';
    });
}

// Zmiana funkcji loadElements
async function loadElements() {
    try {
        // Pobierz notatki i zadania
        const [notes, tasks] = await Promise.all([
            fetch('/api/notes').then(r => r.json()),
            fetch('/api/tasks').then(r => r.json())
        ]);
        
        displayNotes(notes);
        displayTasks(tasks);
    } catch (error) {
        console.error('Error loading elements:', error);
    }
}

// Chat functionality
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-message');
const clearButton = document.getElementById('clear-chat');

// Generate a random session ID
const sessionId = Math.random().toString(36).substring(7);

// Function to add a message to the chat
function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}-message`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send a message to the API
async function sendMessage(message) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                session_id: sessionId
            })
        });
        
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data.response;
    } catch (error) {
        console.error('Error sending message:', error);
        return 'Sorry, there was an error processing your message.';
    }
}

// Event listeners
sendButton.addEventListener('click', async () => {
    const message = chatInput.value.trim();
    if (message) {
        addMessage(message, 'user');
        chatInput.value = '';
        
        const response = await sendMessage(message);
        addMessage(response, 'assistant');
    }
});

chatInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const message = chatInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            chatInput.value = '';
            
            const response = await sendMessage(message);
            addMessage(response, 'assistant');
        }
    }
});

clearButton.addEventListener('click', async () => {
    try {
        await fetch('/api/chat/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId
            })
        });
        chatMessages.innerHTML = '';
    } catch (error) {
        console.error('Error clearing chat:', error);
    }
});

// Load chat history on page load
async function loadChatHistory() {
    try {
        const response = await fetch(`/api/chat/history?session_id=${sessionId}`);
        const data = await response.json();
        
        if (data.history) {
            data.history.forEach(msg => {
                addMessage(msg.content, msg.role);
            });
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
});

// Obsługa ustawień AI
const aiSettingsButton = document.getElementById('Ai-settings-button');
const aiSettingsModal = document.getElementById('ai-settings-modal');
const closeAiSettingsModal = document.getElementById('close-ai-settings-modal');
const aiSettingsForm = document.getElementById('ai-settings-form');
const aiSettingsSave = document.getElementById('ai-settings-save');

// Domyślne ustawienia
const defaultAiSettings = {
    temperature: 0.7,
    maxTokens: 512,
    apiKey: '',
    userIdentity: '',
    shortTermPlans: '',
    longTermPlans: '',
    responseTone: '',
    responseLength: '',
    llmSubjectArea: ''
};

// Funkcja do ładowania ustawień z localStorage
function loadAiSettings() {
    const savedSettings = localStorage.getItem('aiSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('ai-temperature').value = settings.temperature;
        document.getElementById('ai-max-tokens').value = settings.maxTokens;
        document.getElementById('ai-api-key').value = settings.apiKey;
        document.getElementById('ai-user-identity').value = settings.userIdentity;
        document.getElementById('ai-short-term-plans').value = settings.shortTermPlans;
        document.getElementById('ai-long-term-plans').value = settings.longTermPlans;
        document.getElementById('ai-response-tone').value = settings.responseTone;
        document.getElementById('ai-response-length').value = settings.responseLength;
        document.getElementById('ai-llm-subject-area').value = settings.llmSubjectArea;
    } else {
        // Ustaw wartości domyślne
        document.getElementById('ai-temperature').value = defaultAiSettings.temperature;
        document.getElementById('ai-max-tokens').value = defaultAiSettings.maxTokens;
    }
}

// Funkcja do zapisywania ustawień
function saveAiSettings() {
    const settings = {
        temperature: parseFloat(document.getElementById('ai-temperature').value),
        maxTokens: parseInt(document.getElementById('ai-max-tokens').value),
        apiKey: document.getElementById('ai-api-key').value,
        userIdentity: document.getElementById('ai-user-identity').value,
        shortTermPlans: document.getElementById('ai-short-term-plans').value,
        longTermPlans: document.getElementById('ai-long-term-plans').value,
        responseTone: document.getElementById('ai-response-tone').value,
        responseLength: document.getElementById('ai-response-length').value,
        llmSubjectArea: document.getElementById('ai-llm-subject-area').value
    };
    
    localStorage.setItem('aiSettings', JSON.stringify(settings));
    return settings;
}

// Event listeners dla okna modalnego
aiSettingsButton.addEventListener('click', () => {
    loadAiSettings();
    aiSettingsModal.style.display = 'block';
    aiSettingsModal.classList.add('show');
});

closeAiSettingsModal.addEventListener('click', () => {
    aiSettingsModal.classList.remove('show');
    aiSettingsModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === aiSettingsModal) {
        aiSettingsModal.classList.remove('show');
        aiSettingsModal.style.display = 'none';
    }
});

// Zapisywanie ustawień
aiSettingsSave.addEventListener('click', async () => {
    const settings = saveAiSettings();
    
    try {
        const response = await fetch('/api/chat/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            // Zamknij modal
            aiSettingsModal.classList.remove('show');
            aiSettingsModal.style.display = 'none';
            
            // Pokaż powiadomienie o sukcesie
            showMessage('Ustawienia zostały zapisane', 'success');
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showMessage('Błąd podczas zapisywania ustawień', 'error');
    }
});

// Walidacja pól numerycznych
document.getElementById('ai-temperature').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (value < 0) e.target.value = 0;
    if (value > 2) e.target.value = 2;
});

document.getElementById('ai-max-tokens').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    if (value < 1) e.target.value = 1;
    if (value > 4096) e.target.value = 4096;
});

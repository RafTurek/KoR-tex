// Get the toggle button
const toggleButton = document.getElementById('toggle-theme-button');

// Add event listener for the button
toggleButton.addEventListener('click', () => {
    // Toggle the dark mode class on the body
    document.body.classList.toggle('dark-mode');
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
document.addEventListener('DOMContentLoaded', () => {
    const saveElementButton = document.getElementById('save-element-button');
    
    if (saveElementButton) {
        saveElementButton.addEventListener('click', async () => {
            if (!currentElementType) {
                addSystemMessage('Wybierz najpierw typ elementu (Notatka lub Zadanie)');
                return;
            }

            const textarea = document.getElementById('add-element-textarea');
            if (!textarea) {
                console.error('Nie znaleziono pola tekstowego');
                return;
            }

            const content = textarea.value.trim();
            if (!content) {
                addSystemMessage('Wprowadź treść przed zapisaniem');
                return;
            }

            try {
                if (currentElementType === 'note') {
                    await saveNote();
                } else {
                    await saveTask();
                }
            } catch (error) {
                console.error('Error saving element:', error);
                addSystemMessage('Wystąpił błąd podczas zapisywania. Spróbuj ponownie.');
            }
        });
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
    if (!saveButton) return;
    
    saveButton.disabled = true;
    try {
        const noteData = {
            content: document.getElementById('add-element-textarea').value.trim(),
            category: document.getElementById('note-category')?.value || '',
            project_tag: document.getElementById('note-project-tag')?.value || '#inbox'
        };

        console.log('Saving note:', noteData);

        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Nie udało się zapisać notatki');
        }

        const result = await response.json();
        console.log('Note saved:', result);
        
        clearForm();
        await loadElements();
        addSystemMessage('Notatka została zapisana');
    } catch (error) {
        console.error('Error saving note:', error);
        addSystemMessage(`Błąd: ${error.message}`);
    } finally {
        saveButton.disabled = false;
    }
}

// Funkcja zapisująca zadanie
async function saveTask() {
    const saveButton = document.getElementById('save-element-button');
    if (!saveButton) return;
    
    saveButton.disabled = true;
    try {
        const taskData = {
            content: document.getElementById('add-element-textarea').value.trim(),
            category: document.getElementById('task-category')?.value || '',
            priority: document.getElementById('task-priority')?.value || 'medium',
            deadline: document.getElementById('task-deadline')?.value || null,
            project_tag: document.getElementById('task-project-tag')?.value || '#inbox',
            subtasks: Array.from(document.getElementById('subtasks-list')?.children || [])
                .filter(li => !li.classList.contains('template'))
                .map(li => ({
                    content: li.querySelector('span')?.textContent || '',
                    is_completed: li.querySelector('input[type="checkbox"]')?.checked || false
                }))
        };

        console.log('Saving task:', taskData);

        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Nie udało się zapisać zadania');
        }

        const result = await response.json();
        console.log('Task saved:', result);
        
        clearForm();
        await loadElements();
        addSystemMessage('Zadanie zostało zapisane');
    } catch (error) {
        console.error('Error saving task:', error);
        addSystemMessage(`Błąd: ${error.message}`);
    } finally {
        saveButton.disabled = false;
    }
}

// Funkcja czyszcząca formularz
function clearForm() {
    // Wyczyść textarea
    const textarea = document.getElementById('add-element-textarea');
    if (textarea) textarea.value = '';
    
    // Wyczyść pola notatki
    const noteFields = ['note-project-tag', 'note-category'];
    noteFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
    
    // Wyczyść pola zadania
    const taskFields = ['task-project-tag', 'task-category', 'task-priority', 'task-deadline'];
    taskFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
    
    // Wyczyść listę podzadań
    const subtasksList = document.getElementById('subtasks-list');
    if (subtasksList) subtasksList.innerHTML = '';
    
    // Ukryj kontenery ustawień
    const containers = ['task-settings', 'note-settings', 'subtasks-container'];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) container.style.display = 'none';
    });
    
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

// Funkcja ładująca elementy
async function loadElements() {
    try {
        console.log('Loading elements...');
        const [notesResponse, tasksResponse] = await Promise.all([
            fetch('/api/notes'),
            fetch('/api/tasks')
        ]);

        if (!notesResponse.ok || !tasksResponse.ok) {
            throw new Error('Failed to fetch data');
        }

        const notes = await notesResponse.json();
        const tasks = await tasksResponse.json();
        
        console.log('Loaded notes:', notes);
        console.log('Loaded tasks:', tasks);
        
        await displayNotes(notes);
        await displayTasks(tasks);
        
        // Odśwież filtry projektów
        await loadProjectFilters();
    } catch (error) {
        console.error('Error loading elements:', error);
        addSystemMessage('Wystąpił błąd podczas ładowania elementów');
    }
}

// Funkcja wyświetlająca notatki
async function displayNotes(notes) {
    const notesList = document.querySelector('.notes-list');
    if (!notesList) {
        console.error('Notes list container not found');
        return;
    }
    
    // Znajdź i zachowaj template
    const template = notesList.querySelector('.note-item.template');
    if (!template) {
        console.error('Note template not found');
        return;
    }
    
    // Wyczyść listę, zachowując template
    notesList.innerHTML = '';
    notesList.appendChild(template.cloneNode(true));
    
    console.log(`Displaying ${notes.length} notes`);
    
    notes.forEach(note => {
        try {
            const noteElement = template.cloneNode(true);
            noteElement.classList.remove('template');
            noteElement.style.display = 'block';
            
            // Wypełnij dane notatki
            const projectTag = noteElement.querySelector('.note-project-tag');
            const category = noteElement.querySelector('.note-category');
            const content = noteElement.querySelector('.note-content');
            const date = noteElement.querySelector('.note-date');
            
            if (projectTag) projectTag.textContent = note.project_tag || '#inbox';
            if (category) category.textContent = note.category || '';
            if (content) content.textContent = note.content;
            if (date) date.textContent = new Date(note.created_at).toLocaleDateString();
            
            // Dodaj obsługę przycisków
            const editButton = noteElement.querySelector('.edit-note');
            const deleteButton = noteElement.querySelector('.delete-note');
            
            if (editButton) {
                editButton.onclick = () => editNote(note.id);
            }
            if (deleteButton) {
                deleteButton.onclick = () => deleteNote(note.id);
            }
            
            notesList.appendChild(noteElement);
        } catch (error) {
            console.error('Error displaying note:', error);
        }
    });
}

// Funkcja wyświetlająca zadania
async function displayTasks(tasks) {
    const tasksList = document.querySelector('.tasks-list');
    if (!tasksList) {
        console.error('Tasks list container not found');
        return;
    }
    
    // Znajdź i zachowaj template
    const template = tasksList.querySelector('.task-item.template');
    if (!template) {
        console.error('Task template not found');
        return;
    }
    
    // Wyczyść listę, zachowując template
    tasksList.innerHTML = '';
    tasksList.appendChild(template.cloneNode(true));
    
    console.log(`Displaying ${tasks.length} tasks`);
    
    tasks.forEach(task => {
        try {
            const taskElement = template.cloneNode(true);
            taskElement.classList.remove('template');
            taskElement.style.display = 'block';
            
            // Wypełnij dane zadania
            const projectTag = taskElement.querySelector('.task-project-tag');
            const priority = taskElement.querySelector('.task-priority');
            const deadline = taskElement.querySelector('.task-deadline');
            const content = taskElement.querySelector('.task-content');
            const category = taskElement.querySelector('.task-category');
            
            if (projectTag) projectTag.textContent = task.project_tag || '#inbox';
            if (priority) {
                priority.textContent = task.priority || 'medium';
                priority.className = `task-priority priority-${task.priority || 'medium'}`;
            }
            if (deadline) deadline.textContent = task.deadline ? new Date(task.deadline).toLocaleDateString() : '';
            if (content) content.textContent = task.content;
            if (category) category.textContent = task.category || '';
            
            // Dodaj podzadania
            const subtasksList = taskElement.querySelector('.task-subtasks');
            if (subtasksList && task.subtasks && Array.isArray(task.subtasks)) {
                task.subtasks.forEach(subtask => {
                    const subtaskItem = document.createElement('div');
                    subtaskItem.className = 'subtask-item';
                    subtaskItem.innerHTML = `
                        <input type="checkbox" class="subtask-checkbox" ${subtask.is_completed ? 'checked' : ''}>
                        <span>${subtask.content}</span>
                    `;
                    subtasksList.appendChild(subtaskItem);
                });
            }
            
            // Dodaj obsługę przycisków
            const editButton = taskElement.querySelector('.edit-task');
            const deleteButton = taskElement.querySelector('.delete-task');
            
            if (editButton) {
                editButton.onclick = () => editTask(task.id);
            }
            if (deleteButton) {
                deleteButton.onclick = () => deleteTask(task.id);
            }
            
            tasksList.appendChild(taskElement);
        } catch (error) {
            console.error('Error displaying task:', error);
        }
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
    console.log('Initializing application...');
    loadElements().then(() => {
        console.log('Initial load completed');
    }).catch(error => {
        console.error('Error during initialization:', error);
    });
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

// Model switcher functionality
document.getElementById('modelSelect').addEventListener('change', async function(e) {
    const modelType = e.target.value;
    try {
        const response = await fetch('/api/chat/model', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ model_type: modelType })
        });
        
        if (!response.ok) {
            throw new Error('Failed to switch model');
        }
        
        const data = await response.json();
        addSystemMessage(`Przełączono na model: ${data.model_info.description}`);
    } catch (error) {
        console.error('Error switching model:', error);
        addSystemMessage('Wystąpił błąd podczas przełączania modelu');
    }
});

// Helper function to add system messages
function addSystemMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

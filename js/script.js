// State Management
let todos = [];
let currentFilter = 'all';

// DOM Elements
const todoForm = document.getElementById('todoForm');
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const taskError = document.getElementById('taskError');
const dateError = document.getElementById('dateError');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const filterButtons = document.querySelectorAll('.filter-btn');
const taskCount = document.getElementById('taskCount');
const taskProgress = document.getElementById('taskProgress');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    renderTodos();
    setupEventListeners();
});

// Event Listeners Setup
function setupEventListeners() {
    todoForm.addEventListener('submit', handleSubmit);
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.filter;
            updateFilterButtons();
            renderTodos();
        });
    });
}

// Form Validation
function validateForm() {
    let isValid = true;
    
    // Clear previous errors
    taskError.textContent = '';
    dateError.textContent = '';
    taskInput.classList.remove('error');
    dateInput.classList.remove('error');
    
    // Validate task
    if (!taskInput.value.trim()) {
        taskError.textContent = 'Task cannot be empty';
        taskInput.classList.add('error');
        isValid = false;
    }
    
    // Validate date
    if (!dateInput.value) {
        dateError.textContent = 'Date is required';
        dateInput.classList.add('error');
        isValid = false;
    } else {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            dateError.textContent = 'Date cannot be in the past';
            dateInput.classList.add('error');
            isValid = false;
        }
    }
    
    return isValid;
}

// Handle Form Submit
function handleSubmit(e) {
    e.preventDefault();
    
    if (validateForm()) {
        const newTodo = {
            id: Date.now(),
            task: taskInput.value.trim(),
            date: dateInput.value,
            completed: false,
            createdAt: new Date()
        };
        
        todos.push(newTodo);
        saveTodos();
        renderTodos();
        
        // Reset form
        taskInput.value = '';
        dateInput.value = '';
        taskError.textContent = '';
        dateError.textContent = '';
        taskInput.classList.remove('error');
        dateInput.classList.remove('error');
    }
}

// Toggle Todo Completion
function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
}

// Delete Todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// Filter Todos
function getFilteredTodos() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    switch(currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        case 'today':
            return todos.filter(todo => {
                const todoDate = new Date(todo.date);
                todoDate.setHours(0, 0, 0, 0);
                return todoDate.getTime() === now.getTime();
            });
        case 'upcoming':
            return todos.filter(todo => {
                const todoDate = new Date(todo.date);

                // Normalisasi jam pada keduanya
                const today = new Date();
                today.setHours(0, 0, 0, 0); 
                todoDate.setHours(0, 0, 0, 0);

                return todoDate > today && !todo.completed;
            });
        default:
            return todos;
    }
}

// Update Filter Buttons
function updateFilterButtons() {
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
}


function formatDateTime(dateObj) {
    const options = { 
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    };
    return dateObj.toLocaleDateString('id-ID', options);
}


// Render Todos
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    todoList.innerHTML = "";

    if (filteredTodos.length === 0) {
        emptyState.classList.add("show");
        todoList.classList.add("hidden");
        return;
    }

    emptyState.classList.remove("show");
    todoList.classList.remove("hidden");

    const template = document.getElementById("todoTemplate");

    filteredTodos.forEach(todo => {
        const clone = template.content.cloneNode(true);
        const item = clone.querySelector(".todo-item");

        // Add classes
        if (todo.completed) {
            item.classList.add("completed");
        }

        // Task text
        clone.querySelector(".todo-task").textContent = todo.task;

        // Dates
        clone.querySelector(".added-date").textContent =
            "Added : " + formatDateTime(new Date(todo.createdAt));
        clone.querySelector(".due-date").textContent =
            "Due : " + formatDate(todo.date);

        // Checkbox icon
        const checkbox = clone.querySelector(".todo-checkbox");
        checkbox.innerHTML = todo.completed
            ? `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
               <polyline points="22 4 12 14.01 9 11.01"></polyline>`
            : `<circle cx="12" cy="12" r="10"></circle>`;

        // Checkbox event
        checkbox.addEventListener("click", () => toggleTodo(todo.id));

        // Delete
        clone.querySelector(".todo-delete")
            .addEventListener("click", () => deleteTodo(todo.id));

        todoList.appendChild(clone);
    });

    // Update sidebar info
    taskCount.textContent = filteredTodos.length;

    const completedCount = todos.filter(t => t.completed).length;
    taskProgress.textContent = `${completedCount} of ${todos.length} completed`;
}


// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Local Storage Functions
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const stored = localStorage.getItem('todos');
    if (stored) {
        try {
            todos = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading todos:', e);
            todos = [];
        }
    }
}

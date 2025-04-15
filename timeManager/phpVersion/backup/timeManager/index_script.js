// DOM Elements
const scheduleGrid = document.getElementById('schedule-grid');
const prevWeekBtn = document.getElementById('prev-week');
const nextWeekBtn = document.getElementById('next-week');
const currentWeekElement = document.getElementById('current-week');
const taskModal = document.getElementById('task-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelTaskBtn = document.getElementById('cancel-task');
const taskForm = document.getElementById('task-form');

// App State
const state = {
    currentDate: new Date(),
    weekStart: null,
    weekEnd: null,
    tasks: {},
    selectedDay: null,
    selectedHour: null
};

// Initialize UI
function init() {
    updateWeekDates();
    generateGrid();
    loadTasks(); // Would fetch from API in a real application

    // Event Listeners
    prevWeekBtn.addEventListener('click', navigateToPrevWeek);
    nextWeekBtn.addEventListener('click', navigateToNextWeek);
    closeModalBtn.addEventListener('click', closeModal);
    cancelTaskBtn.addEventListener('click', closeModal);
    taskForm.addEventListener('submit', handleTaskFormSubmit);
}

// Update current week dates based on state.currentDate
function updateWeekDates() {
    // Get the first day of the week (Sunday)
    const currentDay = state.currentDate.getDay();
    const diff = state.currentDate.getDate() - currentDay;

    state.weekStart = new Date(state.currentDate);
    state.weekStart.setDate(diff);

    state.weekEnd = new Date(state.weekStart);
    state.weekEnd.setDate(state.weekStart.getDate() + 6);

    // Format dates for display
    const startMonth = state.weekStart.toLocaleString('default', { month: 'short' });
    const endMonth = state.weekEnd.toLocaleString('default', { month: 'short' });

    currentWeekElement.textContent = `${startMonth} ${state.weekStart.getDate()} - ${endMonth} ${state.weekEnd.getDate()}, ${state.weekEnd.getFullYear()}`;
}

// Generate the schedule grid
function generateGrid() {
    scheduleGrid.innerHTML = '';

    // Add empty top-left corner cell
    const cornerCell = document.createElement('div');
    cornerCell.className = 'time-header';
    scheduleGrid.appendChild(cornerCell);

    // Add day headers
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(state.weekStart);
        dayDate.setDate(state.weekStart.getDate() + i);

        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';

        // Mark Friday and Saturday as weekend
        if (i === 5 || i === 6) {
            dayHeader.classList.add('weekend');
        }

        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        dayName.textContent = dayDate.toLocaleString('default', { weekday: 'short' });

        const dateSpan = document.createElement('div');
        dateSpan.className = 'day-date';
        dateSpan.textContent = `${dayDate.getMonth() + 1}/${dayDate.getDate()}`;

        dayHeader.appendChild(dayName);
        dayHeader.appendChild(dateSpan);
        scheduleGrid.appendChild(dayHeader);
    }

    // Add time slots (8 AM to 10 PM)
    for (let hour = 8; hour <= 22; hour++) {
        // Add time label
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = formatHour(hour);
        scheduleGrid.appendChild(timeLabel);

        // Add time slots for each day
        for (let day = 0; day < 7; day++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.dataset.day = day;
            timeSlot.dataset.hour = hour;

            // Mark Friday and Saturday slots with weekend class
            if (day === 5 || day === 6) {
                timeSlot.classList.add('weekend');
            }

            // Add click event to create new task
            timeSlot.addEventListener('click', () => openTaskModal(day, hour));

            scheduleGrid.appendChild(timeSlot);
        }
    }

    // Render existing tasks
    renderTasks();
}

// Format hour for display (8 AM, 9 AM, etc.)
function formatHour(hour) {
    if (hour < 12) {
        return `${hour} AM`;
    } else if (hour === 12) {
        return '12 PM';
    } else {
        return `${hour - 12} PM`;
    }
}

// Open task creation modal
function openTaskModal(day, hour) {
    state.selectedDay = day;
    state.selectedHour = hour;

    // Set form hidden fields
    document.getElementById('task-day').value = day;
    document.getElementById('task-hour').value = hour;

    // Calculate the date for display
    const taskDate = new Date(state.weekStart);
    taskDate.setDate(state.weekStart.getDate() + day);

    // Update modal title
    document.querySelector('.modal-title').textContent = `Add Task for ${taskDate.toLocaleDateString('en-US', { weekday: 'long' })} at ${formatHour(hour)}`;

    // Show modal
    taskModal.style.display = 'flex';
}

// Close task modal
function closeModal() {
    taskModal.style.display = 'none';
    taskForm.reset();
}

// Handle task form submission
function handleTaskFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('task-title').value;
    const duration = parseInt(document.getElementById('task-duration').value);
    const color = document.getElementById('task-color').value;
    const day = state.selectedDay;
    const hour = state.selectedHour;

    // Create unique task ID
    const taskId = `task-${Date.now()}`;

    // Create task object
    // for ahmed hafez: this is the objects shape that you need to handle
    /*

        {
            "id": "task-1743682594056",
            "title": "Deployment Planning",
            "day": 5,
            "hour": 10,
            "duration": 3,
            "color": "task-color-4"
        }

     */
    const task = {
        id: taskId,
        title,
        day,
        hour,
        duration,
        color
    };

    // Save task (would send to API in a real application)
    saveTask(task);

    // Close modal
    closeModal();
}

// Save task to state and render
function saveTask(task) {
    // Create week key in format "YYYY-MM-DD" of start date
    const weekKey = state.weekStart.toISOString().split('T')[0];

    if (!state.tasks[weekKey]) {
        state.tasks[weekKey] = [];
    }

    state.tasks[weekKey].push(task);

    // Save to localStorage (substitute for API call)
    localStorage.setItem('scheduler-tasks', JSON.stringify(state.tasks));

    // Render the new task
    renderTasks();
}

// Load tasks from storage
function loadTasks() {
    // for ahmed hafez: here you can change it from localstorage to wahtever you will use to handle it(api, json, ajax, xml etc)
    const savedTasks = localStorage.getItem('scheduler-tasks');
    if (savedTasks) {
        state.tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

// Render all tasks for the current week
function renderTasks() {
    // Clear existing tasks from UI
    document.querySelectorAll('.task').forEach(el => el.remove());

    // Get tasks for current week
    const weekKey = state.weekStart.toISOString().split('T')[0];
    const weekTasks = state.tasks[weekKey] || [];

    // Render each task
    weekTasks.forEach(task => {
        renderTask(task);
    });
}

// Render a single task
function renderTask(task) {
    // Find all affected time slots
    for (let i = 0; i < task.duration; i++) {
        const hour = task.hour + i;
        if (hour > 22) break; // Don't go past 10 PM

        const timeSlot = document.querySelector(`.time-slot[data-day="${task.day}"][data-hour="${hour}"]`);
        if (timeSlot) {
            // Mark slot as occupied
            timeSlot.dataset.occupied = 'true';

            // Only create the task element in the first hour slot
            if (i === 0) {
                const taskElement = document.createElement('div');
                taskElement.className = `task ${task.color}`;
                taskElement.id = task.id;
                taskElement.style.backgroundColor = `var(--${task.color})`;
                taskElement.style.top = '2px';
                taskElement.style.height = `${task.duration * 60 - 4}px`;

                const taskTitle = document.createElement('div');
                taskTitle.className = 'task-title';
                taskTitle.textContent = task.title;

                const taskTime = document.createElement('div');
                taskTime.className = 'task-time';
                taskTime.textContent = `${formatHour(task.hour)} - ${formatHour(task.hour + task.duration)}`;

                taskElement.appendChild(taskTitle);
                taskElement.appendChild(taskTime);

                // Add event listener to edit task (would be implemented in full version)
                taskElement.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent opening a new task
                    // Edit task functionality would be added here
                    alert(`Edit task: ${task.title}`);
                });

                timeSlot.appendChild(taskElement);
            }
        }
    }
}

// Navigate to previous week
function navigateToPrevWeek() {
    state.currentDate.setDate(state.currentDate.getDate() - 7);
    updateWeekDates();
    generateGrid();
}

// Navigate to next week
function navigateToNextWeek() {
    state.currentDate.setDate(state.currentDate.getDate() + 7);
    updateWeekDates();
    generateGrid();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);

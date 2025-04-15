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
        if (i === 5) {
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
    for (let hour = 7; hour <= 23; hour++) {
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
            if (day === 5) {
                timeSlot.classList.add('weekend');
            }

            // Add click event to create new task
            timeSlot.addEventListener('click', () => {
                const currentWeek = getWeekNumber(state.weekStart);
                const currentYear = state.weekStart.getFullYear();
                openTaskModal(day, hour, currentWeek, currentYear);
            });

            scheduleGrid.appendChild(timeSlot);
        }
    }

    loadTasks();
}

function getWeekNumber(date) {
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    currentDate.setDate(currentDate.getDate() - (currentDate.getDay() + 6) % 7 + 3);

    const firstThursday = new Date(currentDate.getFullYear(), 0, 1);
    firstThursday.setDate(firstThursday.getDate() - (firstThursday.getDay() + 6) % 7 + 3);

    const weekNumber = Math.ceil(((currentDate - firstThursday) / 86400000 + 1) / 7);

    return weekNumber;
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
function openTaskModal(day, hour, week, year) {
    state.selectedDay = day;
    state.selectedHour = hour;

    // Set form hidden fields
    document.getElementById('task-day').value = day;
    document.getElementById('task-hour').value = hour;
    document.getElementById('task-week').value = week;
    document.getElementById('task-year').value = year;

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

function handleTaskFormSubmit(e) {
    e.preventDefault();

    const user_id = document.getElementById('user_id').value;
    const title = document.getElementById('task-title').value;
    const duration = parseInt(document.getElementById('task-duration').value);
    const color = document.getElementById('task-color').value;
    const day = state.selectedDay;
    const hour = state.selectedHour;
    const week = document.getElementById('task-week').value;
    const year = document.getElementById('task-year').value;

    // Create unique task ID (we don't need this on the server side, it's for the frontend)
    const taskId = `task-${Date.now()}`;

    // Create task object
    const task = {
        id: taskId,
        title,
        day,
        hour,
        duration,
        color
    };

    // Send task to PHP backend (save to database)
    const formData = new FormData();
    formData.append('user_id', user_id);
    formData.append('title', task.title);
    formData.append('day', task.day);
    formData.append('hour', task.hour);
    formData.append('week', week);
    formData.append('year', year);
    formData.append('duration', task.duration);
    formData.append('color', task.color);

    fetch('./ajax/save_task.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            closeModal();
            loadTasks();
        } else {
            alert('Failed to save task');
        }
    });
}

function loadTasks() {

    // Get the start date of the week
    const user_id = document.getElementById('user_id').value;
    const weekStart = state.weekStart.toISOString().split('T')[0];
    fetch(`./ajax/load_tasks.php?week_start=${weekStart}&user_id=${user_id}`)
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
                renderTask(task);
            });
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
        });
}


// Render a single task
function renderTask(task) {
    // Find all affected time slots
    for (let i = 0; i < task.duration; i++) {
        const hour = task.hour + i;
        if (hour > 23) break; // Don't go past 10 PM

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
                const to_hour = parseInt(task.hour, 10) + parseInt(task.duration, 10);
                taskTime.textContent = `${formatHour(task.hour)} - ${formatHour(to_hour)}`;

                taskElement.appendChild(taskTitle);
                taskElement.appendChild(taskTime);

                // Add event listener to edit task (would be implemented in full version)
                taskElement.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent opening a new task
                    const isConfirmed = confirm(`Are you sure you want to delete the task: ${task.title}?`);

                    if (isConfirmed) {
                        deleteTask(task.id);
                    }
                });

                timeSlot.appendChild(taskElement);
            }
        }
    }
}

function deleteTask(taskId) {
    fetch(`./ajax/delete_task.php?task_id=${taskId}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Task deleted successfully!');
            updateWeekDates();
            generateGrid();
        } else {
            alert('Failed to delete task.');
        }
    })
    .catch(error => {
        console.error('Error deleting task:', error);
    });
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

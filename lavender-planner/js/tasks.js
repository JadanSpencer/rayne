// Enhanced Task Management System
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskList = document.getElementById('taskList');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const taskForm = document.getElementById('taskForm');
    const modalTitle = document.getElementById('modalTitle');
    const taskIdInput = document.getElementById('taskId');
    const filterPriority = document.getElementById('filterPriority');
    const filterStatus = document.getElementById('filterStatus');
    const sortBy = document.getElementById('sortBy');
    
    // Priority counters
    const highPriorityCount = document.getElementById('highPriorityCount');
    const mediumPriorityCount = document.getElementById('mediumPriorityCount');
    const lowPriorityCount = document.getElementById('lowPriorityCount');
    
    // Progress elements
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const teddyMarker = document.getElementById('teddyMarker');
    
    // Task data
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let isEditMode = false;
    
    // Initialize the app
    function init() {
        renderTaskList();
        updatePriorityCounts();
        updateProgress();
        setupEventListeners();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Add task button
        addTaskBtn.addEventListener('click', openAddTaskModal);
        
        // Modal buttons
        closeModal.addEventListener('click', closeTaskModal);
        cancelBtn.addEventListener('click', closeTaskModal);
        
        // Form submission
        taskForm.addEventListener('submit', handleFormSubmit);
        
        // Filter and sort changes
        filterPriority.addEventListener('change', renderTaskList);
        filterStatus.addEventListener('change', renderTaskList);
        sortBy.addEventListener('change', renderTaskList);
    }
    
    // Open modal for adding a new task
    function openAddTaskModal() {
        isEditMode = false;
        modalTitle.textContent = 'Add New Task';
        taskForm.reset();
        taskIdInput.value = '';
        taskModal.style.display = 'flex';
    }
    
    // Open modal for editing an existing task
    function openEditTaskModal(taskId) {
        isEditMode = true;
        modalTitle.textContent = 'Edit Task';
        
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            taskIdInput.value = task.id;
            document.getElementById('title').value = task.title;
            document.getElementById('description').value = task.description || '';
            document.getElementById('course').value = task.course || '';
            
            // Format date for input field (YYYY-MM-DD)
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const formattedDate = dueDate.toISOString().split('T')[0];
                document.getElementById('dueDate').value = formattedDate;
            } else {
                document.getElementById('dueDate').value = '';
            }
            
            document.getElementById('priority').value = task.priority;
        }
        
        taskModal.style.display = 'flex';
    }
    
    // Close the task modal
    function closeTaskModal() {
        taskModal.style.display = 'none';
    }
    
    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const taskData = {
            id: isEditMode ? taskIdInput.value : Date.now().toString(),
            title: document.getElementById('title').value.trim(),
            description: document.getElementById('description').value.trim(),
            course: document.getElementById('course').value.trim(),
            dueDate: document.getElementById('dueDate').value,
            priority: document.getElementById('priority').value,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Validate required fields
        if (!taskData.title || !taskData.dueDate || !taskData.priority) {
            alert('Please fill in all required fields (marked with *)');
            return;
        }
        
        if (isEditMode) {
            updateTask(taskData);
        } else {
            addTask(taskData);
        }
        
        closeTaskModal();
    }
    
    // Add a new task
    function addTask(task) {
        tasks.unshift(task);
        saveTasks();
        renderTaskList();
        updatePriorityCounts();
        updateProgress();
    }
    
    // Update an existing task
    function updateTask(updatedTask) {
        tasks = tasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
        );
        saveTasks();
        renderTaskList();
        updatePriorityCounts();
        updateProgress();
    }
    
    // Delete a task
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTaskList();
            updatePriorityCounts();
            updateProgress();
        }
    }
    
    // Toggle task completion status
    // In tasks.js, this function should already be correct, but verify it looks like this:
function toggleTaskCompletion(taskId) {
    tasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTaskList();
    updateProgress();
}
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Render the task list based on filters and sort
    function renderTaskList() {
        const priorityFilter = filterPriority.value;
        const statusFilter = filterStatus.value;
        const sortByValue = sortBy.value;
        
        // Filter tasks
        let filteredTasks = [...tasks];
        
        if (priorityFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        
        if (statusFilter !== 'all') {
            const isCompleted = statusFilter === 'completed';
            filteredTasks = filteredTasks.filter(task => task.completed === isCompleted);
        }
        
        // Sort tasks
        filteredTasks.sort((a, b) => {
            if (sortByValue === 'priority') {
                const priorityOrder = { high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            } else if (sortByValue === 'title') {
                return a.title.localeCompare(b.title);
            } else {
                // Default sort by due date
                const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
                const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
                return dateA - dateB;
            }
        });
        
        // Clear the task list
        taskList.innerHTML = '';
        
        // Add tasks to the DOM
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h3>No tasks found</h3>
                    <p>${priorityFilter !== 'all' || statusFilter !== 'all' ? 
                        'Try adjusting your filters' : 
                        'Add a new task to get started!'}
                    </p>
                </div>
            `;
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = `task-card ${task.priority}-priority ${task.completed ? 'completed' : ''}`;
            taskCard.dataset.id = task.id;
            
            taskCard.innerHTML = `
                <h3 class="task-title">
                    ${task.completed ? '<i class="fas fa-check-circle"></i>' : ''}
                    ${task.title}
                </h3>
                ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                <div class="task-meta">
                    ${task.course ? `<span>${task.course}</span>` : '<span></span>'}
                    <span>Due: ${formatDueDate(task.dueDate)}</span>
                </div>
                <div class="task-actions">
                    <span class="priority-label">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
                    <div>
                        <button class="task-btn edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="task-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
                        <button class="task-btn complete-btn" title="${task.completed ? 'Mark Pending' : 'Mark Complete'}">
                            <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                        </button>
                    </div>
                </div>
            `;
            
            taskList.appendChild(taskCard);
            
            // Add event listeners to the buttons
            taskCard.querySelector('.edit-btn').addEventListener('click', () => openEditTaskModal(task.id));
            taskCard.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
            taskCard.querySelector('.complete-btn').addEventListener('click', () => toggleTaskCompletion(task.id));
        });
        
        // Enable drag and drop
        enableDragAndDrop();
    }
    
    // Update priority counts
    function updatePriorityCounts() {
    const highCount = tasks.filter(task => task.priority === 'high').length;
    const mediumCount = tasks.filter(task => task.priority === 'medium').length;
    const lowCount = tasks.filter(task => task.priority === 'low').length;
    
    // Only update the elements if they exist
    if (highPriorityCount) highPriorityCount.textContent = highCount;
    if (mediumPriorityCount) mediumPriorityCount.textContent = mediumCount;
    if (lowPriorityCount) lowPriorityCount.textContent = lowCount;
}
    
    // Update progress tracking
    function updateProgress() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Only update elements if they exist
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${progress}%`;
    }
    
    if (teddyMarker) {
        // Position the teddy marker
        const teddyPosition = progress > 100 ? 100 : progress < 0 ? 0 : progress;
        teddyMarker.style.left = `calc(${teddyPosition}% - 20px)`;
        
        // Animate the teddy bear
        teddyMarker.style.animation = 'none';
        teddyMarker.offsetHeight; // Trigger reflow
        teddyMarker.style.animation = 'wiggle 1s ease';
    }
}
    
    // Format due date for display
    function formatDueDate(dateString) {
        if (!dateString) return "No date";
        
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return "Tomorrow";
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    }
    
    // Initialize the app
    init();
});
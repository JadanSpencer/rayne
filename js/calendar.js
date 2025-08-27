let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];

const EVENT_TYPES = {
    CLASS: 'class',
    ASSIGNMENT: 'assignment',
    EXAM: 'exam',
    STUDY: 'study',
    PERSONAL: 'personal'
};

document.addEventListener('DOMContentLoaded', function() {
    // Current week dates
    let currentWeekStart = getStartOfWeek(new Date());
    let currentEditingEventId = null;
    
    // Initialize the calendar
    initCalendar();
    createClouds();
    
    // Navigation buttons
    document.getElementById('prev-week').addEventListener('click', function() {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        updateCalendar();
    });
    
    document.getElementById('next-week').addEventListener('click', function() {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        updateCalendar();
    });
    
    document.getElementById('today-btn').addEventListener('click', function() {
        currentWeekStart = getStartOfWeek(new Date());
        updateCalendar();
    });
    
    // Add event button
    document.getElementById('add-event').addEventListener('click', function() {
        currentEditingEventId = null;
        document.getElementById('delete-event').style.display = 'none';
        openEventModal();
    });
    
    // Modal close button
    document.querySelector('.close-modal').addEventListener('click', function() {
        closeEventModal();
    });
    
    // Click outside modal to close
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('event-modal')) {
            closeEventModal();
        }
    });
    
    // Event form submission
    document.getElementById('event-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveEvent();
    });
    
    // Delete event button
    document.getElementById('delete-event').addEventListener('click', function() {
        if (currentEditingEventId) {
            deleteEvent(currentEditingEventId);
            closeEventModal();
        }
    });
    
    // Function to initialize the calendar
    function initCalendar() {
        initTimeDropdowns();
        updateCalendar();
    }
    
    // Function to update the calendar with the current week
    // Update the updateCalendar function to fix date calculation
// Update the updateCalendar function to fix time column alignment and set time range from 5AM to 4AM
function updateCalendar() {
    const weeklyTimetable = document.querySelector('.weekly-timetable');
    weeklyTimetable.innerHTML = '';
    
    // Recreate the time column
    const timeColumn = document.createElement('div');
    timeColumn.className = 'time-column';
    timeColumn.innerHTML = '<div class="time-header">Time</div>';
    
    // Create time labels from 5AM to 4AM (24 hours) - ONE CELL PER HOUR
    for (let hour = 5; hour < 29; hour++) {
        const displayHour = hour % 24;
        const timeCell = document.createElement('div');
        timeCell.className = 'time-cell'; // Changed from time-label to time-cell
        timeCell.textContent = formatHour(displayHour);
        timeCell.dataset.time = displayHour;
        timeColumn.appendChild(timeCell);
    }
    
    weeklyTimetable.appendChild(timeColumn);
    
    // Update week range display
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const options = { month: 'long', day: 'numeric' };
    const startStr = currentWeekStart.toLocaleDateString('en-US', options);
    const endStr = weekEnd.toLocaleDateString('en-US', options);
    const year = currentWeekStart.getFullYear();
    
    document.getElementById('current-week-range').textContent = `${startStr} - ${endStr}, ${year}`;
    
    // Create day columns with correct dates
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Start with the current week start date
    const date = new Date(currentWeekStart);
    
    days.forEach((day, index) => {
        // Create a new date object for each day to avoid reference issues
        const dayDate = new Date(date);
        dayDate.setDate(date.getDate() + index);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'day-column';
        dayElement.dataset.day = day;
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        
        const dayName = document.createElement('div');
        dayName.textContent = day.charAt(0).toUpperCase() + day.slice(1);
        
        const dayDateElement = document.createElement('div');
        dayDateElement.className = 'date';
        dayDateElement.textContent = dayDate.getDate();
        
        dayHeader.appendChild(dayName);
        dayHeader.appendChild(dayDateElement);
        dayElement.appendChild(dayHeader);
        
        // Create time slots for this day (5AM to 4AM) - ONE CELL PER HOUR
        for (let hour = 5; hour < 29; hour++) {
            const displayHour = hour % 24;
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.dataset.day = day;
            timeSlot.dataset.date = formatDate(dayDate);
            timeSlot.dataset.time = displayHour;
            dayElement.appendChild(timeSlot);
        }
        
        weeklyTimetable.appendChild(dayElement);
    });
    
    // Load events for this week
    loadEventsForWeek();
    
    // Setup mobile behavior
    setupMobileBehavior();
}
    
    // Function to get start of week (Monday)
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
}
    
    // Function to initialize time dropdowns
    // Function to initialize time dropdowns
function initTimeDropdowns() {
    const startSelect = document.getElementById('event-start');
    const endSelect = document.getElementById('event-end');
    
    startSelect.innerHTML = '';
    endSelect.innerHTML = '';
    
    // Create 24-hour options from 5AM to 4AM
    for (let hour = 5; hour < 29; hour++) {
        const displayHour = hour % 24;
        const timeLabel = formatHour(displayHour);
        
        const startOption = document.createElement('option');
        startOption.value = displayHour;
        startOption.textContent = timeLabel;
        startSelect.appendChild(startOption);
        
        const endOption = document.createElement('option');
        endOption.value = (displayHour + 1) % 24;
        endOption.textContent = formatHour((displayHour + 1) % 24);
        endSelect.appendChild(endOption);
    }
    
    // Set default end time to +1 hour from start
    startSelect.addEventListener('change', function() {
        endSelect.value = (parseInt(this.value) + 1) % 24;
    });
}
    
    // Format hour for display
    function formatHour(hour) {
        const h = hour % 12 || 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        return `${h}:00 ${ampm}`;
    }
    
    // Format date as YYYY-MM-DD
    function formatDate(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        
        return [year, month, day].join('-');
    }
    
    // Function to open event modal
    function openEventModal() {
        // Set default date to today or first day of current week view
        const today = new Date();
        const formattedDate = formatDate(today);
        document.getElementById('event-date').value = formattedDate;
        
        // Reset form
        document.getElementById('event-form').reset();
        document.getElementById('event-title').focus();
        
        document.getElementById('event-modal').style.display = 'block';
    }
    
    // Function to open event modal with existing event data
    function openEventModalWithData(event) {
        currentEditingEventId = event.id;
        document.getElementById('delete-event').style.display = 'block';
        
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-date').value = event.date;
        document.getElementById('event-start').value = event.startHour;
        document.getElementById('event-end').value = event.endHour;
        document.getElementById('event-color').value = event.color;
        document.getElementById('event-description').value = event.description || '';
        document.getElementById('event-recurring').value = event.recurring || 'none';
        
        document.getElementById('event-modal').style.display = 'block';
    }
    
    // Function to close event modal
    function closeEventModal() {
        document.getElementById('event-modal').style.display = 'none';
        document.getElementById('event-form').reset();
        currentEditingEventId = null;
    }
    
    // Function to save event
    function saveEvent() {
        const title = document.getElementById('event-title').value.trim();
        const date = document.getElementById('event-date').value;
        const startHour = parseInt(document.getElementById('event-start').value);
        const endHour = parseInt(document.getElementById('event-end').value);
        const color = document.getElementById('event-color').value;
        const description = document.getElementById('event-description').value.trim();
        const recurring = document.getElementById('event-recurring').value;
        const eventTypeBtn = document.querySelector('.event-type-btn.active');
        const eventType = eventTypeBtn ? eventTypeBtn.dataset.type : 'personal';
        
        // Validate inputs
        if (!title || !date || isNaN(startHour) || isNaN(endHour)) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (endHour <= startHour) {
            alert('End time must be after start time');
            return;
        }
        
        const eventDate = new Date(date);
        
        // Create event object
        const event = {
            id: currentEditingEventId || Date.now().toString(),
            title,
            date,
            startHour,
            endHour,
            color,
            description,
            recurring,
            createdAt: new Date().toISOString(),
            eventType: eventType
        };
        
        // Save or update event
        if (currentEditingEventId) {
            // Update existing event
            const index = events.findIndex(e => e.id === currentEditingEventId);
            if (index !== -1) {
                events[index] = event;
            }
        } else {
            // Add new event
            events.push(event);
        }
        
        // Save to localStorage
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        
        // Update calendar
        updateCalendar();
        
        // Close modal
        closeEventModal();
    }
    
    // Function to delete event
    function deleteEvent(eventId) {
        events = events.filter(event => event.id !== eventId);
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        updateCalendar();
    }
    
    // Function to load events for the current week
    function loadEventsForWeek() {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekStartStr = formatDate(currentWeekStart);
        const weekEndStr = formatDate(weekEnd);
        
        // Filter events for this week
        const weekEvents = events.filter(event => {
            return event.date >= weekStartStr && event.date <= weekEndStr;
        });
        
        // Add events to calendar
        weekEvents.forEach(event => {
            addEventToCalendar(event);
        });
        
        // Enable event click handlers
        enableEventClickHandlers();
    }
    
    // Function to add event to calendar
    // Function to add event to calendar
function addEventToCalendar(event) {
    const eventDate = new Date(event.date);
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][eventDate.getDay()];
    
    const dayColumn = document.querySelector(`.day-column[data-day="${dayName}"]`);
    if (!dayColumn) return;
    
    // Find all time slots in this day column
    const allSlots = dayColumn.querySelectorAll('.time-slot');
    let startSlot = null;
    
    // Find the slot that matches our event's start hour
    allSlots.forEach(slot => {
        if (parseInt(slot.dataset.time) === event.startHour) {
            startSlot = slot;
        }
    });
    
    if (!startSlot) return;

    // Add event type class if specified
    if (event.eventType) {
        eventElement.classList.add(event.eventType);
    }
    
    // Add priority class if specified
    if (event.priority) {
        eventElement.classList.add(`priority-${event.priority}`);
    }
    
    // Calculate days until event
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const eventDay = new Date(event.date);
    eventDay.setHours(0, 0, 0, 0);
    
    const timeDiff = eventDay.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Determine if event is upcoming
    let dueClass = '';
    if (daysDiff === 0) {
        dueClass = 'due-today';
    } else if (daysDiff === 1) {
        dueClass = 'due-1-day';
    } else if (daysDiff === 2) {
        dueClass = 'due-2-days';
    } else if (daysDiff === 3) {
        dueClass = 'due-3-days';
    }
    
    // Create event element
    const eventElement = document.createElement('div');
    eventElement.className = `calendar-event ${event.color} ${dueClass}`;
    eventElement.dataset.eventId = event.id;
    
    const duration = event.endHour - event.startHour;
    eventElement.style.height = `calc(${duration * 40}px - 4px)`;
    
    eventElement.innerHTML = `
        <div class="event-title">${event.title}</div>
        <div class="event-time">${formatHour(event.startHour)} - ${formatHour(event.endHour)}</div>
        ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
    `;
    
    startSlot.appendChild(eventElement);
}

    // Add this at the beginning of your calendar.js file
    function setupMobileBehavior() {
        // Make time slots tappable on mobile
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', function() {
                if (window.innerWidth > 768) return;
                
                const date = this.dataset.date;
                const time = parseInt(this.dataset.time);
                
                if (!date || isNaN(time)) return;
                
                currentEditingEventId = null;
                document.getElementById('delete-event').style.display = 'none';
                
                // Set default values
                document.getElementById('event-date').value = date;
                document.getElementById('event-start').value = time;
                document.getElementById('event-end').value = time + 1;
                
                openEventModal();
            });
        });
    }
    
    // Function to enable event click handlers
    function enableEventClickHandlers() {
        document.querySelectorAll('.calendar-event').forEach(eventElement => {
            eventElement.addEventListener('click', function() {
                const eventId = this.dataset.eventId;
                const event = events.find(e => e.id === eventId);
                if (event) {
                    openEventModalWithData(event);
                }
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Add event type buttons functionality
    initEventTypeSelector();
    
    // Add university tool buttons functionality
    initUniversityTools();
    
    // Add quick add button functionality
    initQuickAddButton();
    
    // Add current time indicator
    addCurrentTimeIndicator();
    
    // Update current time indicator periodically
    setInterval(updateCurrentTimeIndicator, 60000);
    
    // Calculate and update semester progress
    updateSemesterProgress();
});

// This should be added to your calendar.js or similar file
function updateEventStatuses() {
    const now = new Date();
    const eventElements = document.querySelectorAll('.calendar-event');
    
    eventElements.forEach(eventElement => {
        const eventId = eventElement.dataset.eventId;
        const event = events.find(e => e.id === eventId);
        if (!event) return;
        
        const eventDate = new Date(event.date);
        // Set time to event's start time
        eventDate.setHours(event.startHour, 0, 0, 0);
        
        const timeDiff = eventDate - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // Remove all status classes
        eventElement.classList.remove('due-soon', 'due-now');
        
        // Add appropriate class based on time remaining
        if (hoursDiff <= 24 && hoursDiff > 0) {
            eventElement.classList.add('due-soon');
            // Set CSS variables based on event color
            const colorMap = {
                lavender: '#e6e6fa',
                pink: '#ffc0cb',
                blue: '#add8e6',
                green: '#98fb98',
                yellow: '#fffacd',
                purple: '#d8bfd8'
            };
            eventElement.style.setProperty('--original-color', colorMap[event.color] || '#e6e6fa');
            eventElement.style.setProperty('--pulse-color', '#ffb6c1');
        } else if (hoursDiff <= 0) {
            eventElement.classList.add('due-now');
        }
    });
}

// Create clouds
// Create realistic clouds
function createClouds() {
    const container = document.querySelector('.lavender-background');
    const cloudCount = 15; // Increased number of clouds
    
    // Cloud types with different shapes
    const cloudTypes = [
        { class: 'small', parts: 2 },
        { class: 'medium', parts: 3 },
        { class: 'large', parts: 3 }
    ];
    
    for (let i = 0; i < cloudCount; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        // Random cloud type
        const type = cloudTypes[Math.floor(Math.random() * cloudTypes.length)];
        cloud.classList.add(type.class);
        
        // Random opacity class
        const opacityClass = `opacity-${Math.floor(Math.random() * 4) + 1}`;
        cloud.classList.add(opacityClass);
        
        // Random position - more towards the top
        const top = Math.random() * 70; // 70% from top
        cloud.style.top = `${top}%`;
        
        // Random animation duration (slower for larger clouds)
        const duration = type.class === 'small' ? (Math.random() * 60) + 60 :
                        type.class === 'medium' ? (Math.random() * 90) + 90 :
                        (Math.random() * 120) + 120;
        cloud.style.animationDuration = `${duration}s`;
        
        // Random delay (so they don't all start together)
        cloud.style.animationDelay = `-${Math.random() * 120}s`;
        
        container.appendChild(cloud);
    }
}

function initEventTypeSelector() {
    const eventTypeBtns = document.querySelectorAll('.event-type-btn');
    const universityFields = document.querySelector('.university-event-fields');
    
    eventTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            eventTypeBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show university fields for university event types
            const eventType = this.dataset.type;
            if (eventType !== 'personal') {
                universityFields.style.display = 'block';
            } else {
                universityFields.style.display = 'none';
            }
        });
    });
}

// Initialize university tools
function initUniversityTools() {
    // Add class button
    document.getElementById('add-class-btn').addEventListener('click', function() {
        openEventModalWithType(EVENT_TYPES.CLASS);
    });
    
    // Add assignment button
    document.getElementById('add-assignment-btn').addEventListener('click', function() {
        openEventModalWithType(EVENT_TYPES.ASSIGNMENT);
    });
    
    // Add exam button
    document.getElementById('add-exam-btn').addEventListener('click', function() {
        openEventModalWithType(EVENT_TYPES.EXAM);
    });
    
    // Study session button
    document.getElementById('study-session-btn').addEventListener('click', function() {
        openEventModalWithType(EVENT_TYPES.STUDY);
    });
}

// Open modal with specific event type pre-selected
function openEventModalWithType(eventType) {
    currentEditingEventId = null;
    document.getElementById('delete-event').style.display = 'none';
    
    // Open modal
    openEventModal();
    
    // Select the event type
    const eventTypeBtn = document.querySelector(`.event-type-btn[data-type="${eventType}"]`);
    if (eventTypeBtn) {
        eventTypeBtn.click();
    }
    
    // Set default title based on event type
    const titleInput = document.getElementById('event-title');
    switch(eventType) {
        case EVENT_TYPES.CLASS:
            titleInput.value = 'New Class';
            break;
        case EVENT_TYPES.ASSIGNMENT:
            titleInput.value = 'New Assignment';
            break;
        case EVENT_TYPES.EXAM:
            titleInput.value = 'New Exam';
            break;
        case EVENT_TYPES.STUDY:
            titleInput.value = 'Study Session';
            break;
    }
    
    titleInput.focus();
    titleInput.select();
}

// Initialize quick add button
function initQuickAddButton() {
    document.getElementById('quick-event-add').addEventListener('click', function() {
        // Get current date and time for quick event
        const now = new Date();
        const currentHour = now.getHours();
        
        currentEditingEventId = null;
        document.getElementById('delete-event').style.display = 'none';
        
        // Set default values for quick event
        document.getElementById('event-date').value = formatDate(now);
        document.getElementById('event-start').value = currentHour;
        document.getElementById('event-end').value = (currentHour + 1) % 24;
        document.getElementById('event-color').value = 'lavender';
        
        // Open modal
        openEventModal();
        
        // Focus on title field
        document.getElementById('event-title').focus();
    });
}

// Add current time indicator to calendar
function addCurrentTimeIndicator() {
    const timeSlots = document.querySelectorAll('.time-slot');
    if (timeSlots.length === 0) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();
    
    // Adjust for Monday-start week (0=Sunday, 1=Monday, etc.)
    const dayIndex = currentDay === 0 ? 6 : currentDay - 1;
    
    // Find the current day column
    const dayColumns = document.querySelectorAll('.day-column');
    if (dayIndex >= dayColumns.length) return;
    
    const currentDayColumn = dayColumns[dayIndex];
    
    // Create time line element
    const timeLine = document.createElement('div');
    timeLine.className = 'current-time-line';
    timeLine.id = 'current-time-line';
    
    // Position the time line
    const minutesFromTop = (currentHour - 5) * 40 + (currentMinute / 60) * 40;
    timeLine.style.top = `${minutesFromTop}px`;
    
    // Add to current day column
    currentDayColumn.appendChild(timeLine);
}

function updateCurrentTimeIndicator() {
    const timeLine = document.getElementById('current-time-line');
    if (!timeLine) {
        addCurrentTimeIndicator();
        return;
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Position the time line
    const minutesFromTop = (currentHour - 5) * 40 + (currentMinute / 60) * 40;
    timeLine.style.top = `${minutesFromTop}px`;
}

// Calculate and update semester progress
function updateSemesterProgress() {
    // Example dates - in a real app these would come from user settings
    const semesterStart = new Date('2024-01-15');
    const semesterEnd = new Date('2024-05-10');
    const today = new Date();
    
    // Calculate progress percentage
    const totalDays = (semesterEnd - semesterStart) / (1000 * 60 * 60 * 24);
    const daysPassed = (today - semesterStart) / (1000 * 60 * 60 * 24);
    const progressPercent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    
    // Update progress bar
    const progressFill = document.getElementById('semester-progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }
    
    // Update progress text
    const progressText = document.querySelector('.progress-text span:nth-child(2)');
    if (progressText) {
        progressText.textContent = `${Math.round(progressPercent)}% Complete`;
    }
}

// Run this periodically to update event statuses
setInterval(updateEventStatuses, 60000); // Update every minute
updateEventStatuses(); // Initial update
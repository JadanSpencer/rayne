// Drag and drop functionality
// Enhanced drag and drop functionality for calendar events
function enableDragAndDrop() {
    // Make all calendar events draggable
    const events = document.querySelectorAll('.calendar-event');
    
    events.forEach(event => {
        event.draggable = true;
        
        event.addEventListener('dragstart', function(e) {
            this.classList.add('dragging');
            // Store the event ID being dragged
            e.dataTransfer.setData('text/plain', this.dataset.eventId);
            e.dataTransfer.effectAllowed = 'move';
        });
        
        event.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });
    
    // Enable drop zones on all time slots
    const timeSlots = document.querySelectorAll('.time-slot');
    
    timeSlots.forEach(slot => {
        slot.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.classList.add('drop-target');
        });
        
        slot.addEventListener('dragleave', function() {
            this.classList.remove('drop-target');
        });
        
        slot.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drop-target');
            
            const eventId = e.dataTransfer.getData('text/plain');
            const draggingElement = document.querySelector(`.calendar-event[data-event-id="${eventId}"]`);
            const events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
            const event = events.find(ev => ev.id === eventId);
            
            if (draggingElement && event && this.dataset.time && this.dataset.date) {
                // Calculate new time based on drop position
                const newStartHour = parseInt(this.dataset.time);
                const duration = event.endHour - event.startHour;
                const newEndHour = newStartHour + duration;
                
                // Update event data
                event.startHour = newStartHour;
                event.endHour = newEndHour;
                event.date = this.dataset.date;
                
                // Update the event element
                draggingElement.dataset.eventId = event.id;
                draggingElement.style.height = `calc(${duration * 40}px - 4px)`;
                
                const timeDisplay = draggingElement.querySelector('.event-time');
                if (timeDisplay) {
                    timeDisplay.textContent = `${formatHour(newStartHour)} - ${formatHour(newEndHour)}`;
                }
                
                // Update date proximity colors
                updateEventProximityClass(draggingElement, event.date);
                
                // Save changes
                localStorage.setItem('calendarEvents', JSON.stringify(events));
                
                // Append to new slot
                this.appendChild(draggingElement);
            }
        });
    });
    
    // Helper function to format hour
    function formatHour(hour) {
        const h = hour % 12 || 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        return `${h}:00 ${ampm}`;
    }
    
    // Helper function to update event proximity class
    function updateEventProximityClass(eventElement, eventDateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const eventDate = new Date(eventDateStr);
        eventDate.setHours(0, 0, 0, 0);
        
        const timeDiff = eventDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        // Remove all proximity classes
        eventElement.classList.remove('due-today', 'due-1-day', 'due-2-days', 'due-3-days');
        
        // Add appropriate class
        if (daysDiff === 0) {
            eventElement.classList.add('due-today');
        } else if (daysDiff === 1) {
            eventElement.classList.add('due-1-day');
        } else if (daysDiff === 2) {
            eventElement.classList.add('due-2-days');
        } else if (daysDiff === 3) {
            eventElement.classList.add('due-3-days');
        }
    }
}

// Initialize drag and drop when DOM is loaded
// Replace the MutationObserver section at the end of the file with:
document.addEventListener('DOMContentLoaded', function() {
    enableDragAndDrop();
    
    // Only set up MutationObserver if the calendar container exists
    const calendarContainer = document.querySelector('.weekly-timetable');
    if (calendarContainer) {
        const observer = new MutationObserver(function() {
            enableDragAndDrop();
        });
        
        observer.observe(calendarContainer, {
            childList: true,
            subtree: true
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const notebooksGrid = document.getElementById('notebooksGrid');
    const stickyNotesContainer = document.getElementById('stickyNotesContainer');
    const addNotebookBtn = document.getElementById('add-notebook');
    const addStickyNoteBtn = document.getElementById('add-sticky-note');
    const notebookModal = document.getElementById('notebook-modal');
    const stickyModal = document.getElementById('sticky-modal');
    const notebookForm = document.getElementById('notebook-form');
    const stickyForm = document.getElementById('sticky-form');
    const searchNotesInput = document.getElementById('search-notes-input');
    const searchNotesBtn = document.getElementById('search-notes-btn');
    
    // Data
    let notebooks = JSON.parse(localStorage.getItem('notebooks')) || [];
    let stickyNotes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
    let currentEditingNotebookId = null;
    let currentEditingStickyId = null;
    
    // Initialize
    renderNotebooks();
    renderStickyNotes();
    setupEventListeners();
    
    function setupEventListeners() {
        // Notebook buttons
        addNotebookBtn.addEventListener('click', openNotebookModal);
        
        // Sticky note buttons
        addStickyNoteBtn.addEventListener('click', openStickyModal);
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                notebookModal.style.display = 'none';
                stickyModal.style.display = 'none';
            });
        });
        
        // Click outside modal to close
        window.addEventListener('click', function(event) {
            if (event.target === notebookModal) {
                notebookModal.style.display = 'none';
            }
            if (event.target === stickyModal) {
                stickyModal.style.display = 'none';
            }
        });
        
        // Form submissions
        notebookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveNotebook();
        });
        
        stickyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveStickyNote();
        });
        
        // Delete buttons
        document.getElementById('delete-notebook').addEventListener('click', function() {
            if (currentEditingNotebookId) {
                deleteNotebook(currentEditingNotebookId);
                notebookModal.style.display = 'none';
            }
        });
        
        document.getElementById('delete-sticky').addEventListener('click', function() {
            if (currentEditingStickyId) {
                deleteStickyNote(currentEditingStickyId);
                stickyModal.style.display = 'none';
            }
        });
        
        // Search functionality
        searchNotesBtn.addEventListener('click', searchNotes);
        searchNotesInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchNotes();
            }
        });
    }
    
    function renderNotebooks() {
        notebooksGrid.innerHTML = '';
        
        if (notebooks.length === 0) {
            notebooksGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <p>No notebooks yet. Create your first one!</p>
                </div>
            `;
            return;
        }
        
        notebooks.forEach(notebook => {
            const notebookCard = document.createElement('div');
            notebookCard.className = `notebook-card ${notebook.color}`;
            notebookCard.dataset.id = notebook.id;
            
            notebookCard.innerHTML = `
                <h3>${notebook.title}</h3>
                ${notebook.subject ? `<div class="notebook-subject">${notebook.subject}</div>` : ''}
                ${notebook.description ? `<div class="notebook-description">${notebook.description}</div>` : ''}
                <div class="notebook-meta">
                    <span>${formatDate(notebook.createdAt)}</span>
                    <span>${notebook.pageCount || 0} pages</span>
                </div>
            `;
            
            notebookCard.addEventListener('click', () => {
                // In a full implementation, this would open the notebook
                alert(`Opening notebook: ${notebook.title}`);
            });
            
            notebookCard.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                currentEditingNotebookId = notebook.id;
                document.getElementById('delete-notebook').style.display = 'block';
                openNotebookModalWithData(notebook);
            });
            
            notebooksGrid.appendChild(notebookCard);
        });
    }
    
    function renderStickyNotes() {
        stickyNotesContainer.innerHTML = '';
        
        if (stickyNotes.length === 0) {
            stickyNotesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-sticky-note"></i>
                    <p>No sticky notes yet. Add your first one!</p>
                </div>
            `;
            return;
        }
        
        stickyNotes.forEach(note => {
            const stickyNote = document.createElement('div');
            stickyNote.className = `sticky-note ${note.color}`;
            stickyNote.dataset.id = note.id;
            
            stickyNote.innerHTML = `
                <div class="pin"></div>
                ${note.title ? `<h4>${note.title}</h4>` : ''}
                <div class="note-content">${note.content}</div>
                <div class="note-date">${formatShortDate(note.createdAt)}</div>
            `;
            
            stickyNote.addEventListener('click', () => {
                currentEditingStickyId = note.id;
                document.getElementById('delete-sticky').style.display = 'block';
                openStickyModalWithData(note);
            });
            
            // Random rotation for visual effect
            const rotation = Math.random() * 6 - 3; // Between -3 and 3 degrees
            stickyNote.style.transform = `rotate(${rotation}deg)`;
            
            stickyNote.addEventListener('mouseenter', () => {
                stickyNote.style.transform = 'rotate(0deg)';
            });
            
            stickyNote.addEventListener('mouseleave', () => {
                stickyNote.style.transform = `rotate(${rotation}deg)`;
            });
            
            stickyNotesContainer.appendChild(stickyNote);
        });
    }
    
    function openNotebookModal() {
        currentEditingNotebookId = null;
        document.getElementById('delete-notebook').style.display = 'none';
        notebookForm.reset();
        notebookModal.style.display = 'block';
        document.getElementById('notebook-title').focus();
    }
    
    function openNotebookModalWithData(notebook) {
        currentEditingNotebookId = notebook.id;
        document.getElementById('delete-notebook').style.display = 'block';
        
        document.getElementById('notebook-title').value = notebook.title;
        document.getElementById('notebook-subject').value = notebook.subject || '';
        document.getElementById('notebook-color').value = notebook.color;
        document.getElementById('notebook-description').value = notebook.description || '';
        
        notebookModal.style.display = 'block';
    }
    
    function openStickyModal() {
        currentEditingStickyId = null;
        document.getElementById('delete-sticky').style.display = 'none';
        stickyForm.reset();
        stickyModal.style.display = 'block';
        document.getElementById('sticky-content').focus();
    }
    
    function openStickyModalWithData(note) {
        currentEditingStickyId = note.id;
        document.getElementById('delete-sticky').style.display = 'block';
        
        document.getElementById('sticky-title').value = note.title || '';
        document.getElementById('sticky-content').value = note.content;
        document.getElementById('sticky-color').value = note.color;
        
        stickyModal.style.display = 'block';
    }
    
    function saveNotebook() {
        const title = document.getElementById('notebook-title').value.trim();
        const subject = document.getElementById('notebook-subject').value.trim();
        const color = document.getElementById('notebook-color').value;
        const description = document.getElementById('notebook-description').value.trim();
        
        if (!title) {
            alert('Please enter a notebook title');
            return;
        }
        
        const notebook = {
            id: currentEditingNotebookId || Date.now().toString(),
            title,
            subject: subject || null,
            color,
            description: description || null,
            createdAt: new Date().toISOString(),
            pageCount: 0
        };
        
        if (currentEditingNotebookId) {
            // Update existing notebook
            const index = notebooks.findIndex(n => n.id === currentEditingNotebookId);
            if (index !== -1) {
                notebooks[index] = notebook;
            }
        } else {
            // Add new notebook
            notebooks.unshift(notebook);
        }
        
        localStorage.setItem('notebooks', JSON.stringify(notebooks));
        renderNotebooks();
        notebookModal.style.display = 'none';
    }
    
    function saveStickyNote() {
        const title = document.getElementById('sticky-title').value.trim();
        const content = document.getElementById('sticky-content').value.trim();
        const color = document.getElementById('sticky-color').value;
        
        if (!content) {
            alert('Please enter note content');
            return;
        }
        
        const stickyNote = {
            id: currentEditingStickyId || Date.now().toString(),
            title: title || null,
            content,
            color,
            createdAt: new Date().toISOString()
        };
        
        if (currentEditingStickyId) {
            // Update existing note
            const index = stickyNotes.findIndex(n => n.id === currentEditingStickyId);
            if (index !== -1) {
                stickyNotes[index] = stickyNote;
            }
        } else {
            // Add new note
            stickyNotes.unshift(stickyNote);
        }
        
        localStorage.setItem('stickyNotes', JSON.stringify(stickyNotes));
        renderStickyNotes();
        stickyModal.style.display = 'none';
    }
    
    function deleteNotebook(id) {
        notebooks = notebooks.filter(notebook => notebook.id !== id);
        localStorage.setItem('notebooks', JSON.stringify(notebooks));
        renderNotebooks();
    }
    
    function deleteStickyNote(id) {
        stickyNotes = stickyNotes.filter(note => note.id !== id);
        localStorage.setItem('stickyNotes', JSON.stringify(stickyNotes));
        renderStickyNotes();
    }
    
    function searchNotes() {
        const searchTerm = searchNotesInput.value.trim().toLowerCase();
        
        if (!searchTerm) {
            renderNotebooks();
            renderStickyNotes();
            return;
        }
        
        // Filter notebooks
        const filteredNotebooks = notebooks.filter(notebook => {
            return notebook.title.toLowerCase().includes(searchTerm) || 
                   (notebook.subject && notebook.subject.toLowerCase().includes(searchTerm)) || 
                   (notebook.description && notebook.description.toLowerCase().includes(searchTerm));
        });
        
        // Filter sticky notes
        const filteredStickyNotes = stickyNotes.filter(note => {
            return (note.title && note.title.toLowerCase().includes(searchTerm)) || 
                   note.content.toLowerCase().includes(searchTerm);
        });
        
        // Render filtered results
        renderFilteredResults(filteredNotebooks, filteredStickyNotes);
    }
    
    function renderFilteredResults(filteredNotebooks, filteredStickyNotes) {
        // Render notebooks
        notebooksGrid.innerHTML = '';
        
        if (filteredNotebooks.length === 0) {
            notebooksGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No notebooks match your search</p>
                </div>
            `;
        } else {
            filteredNotebooks.forEach(notebook => {
                const notebookCard = document.createElement('div');
                notebookCard.className = `notebook-card ${notebook.color}`;
                notebookCard.dataset.id = notebook.id;
                
                notebookCard.innerHTML = `
                    <h3>${notebook.title}</h3>
                    ${notebook.subject ? `<div class="notebook-subject">${notebook.subject}</div>` : ''}
                    ${notebook.description ? `<div class="notebook-description">${notebook.description}</div>` : ''}
                    <div class="notebook-meta">
                        <span>${formatDate(notebook.createdAt)}</span>
                        <span>${notebook.pageCount || 0} pages</span>
                    </div>
                `;
                
                notebooksGrid.appendChild(notebookCard);
            });
        }
        
        // Render sticky notes
        stickyNotesContainer.innerHTML = '';
        
        if (filteredStickyNotes.length === 0) {
            stickyNotesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No sticky notes match your search</p>
                </div>
            `;
        } else {
            filteredStickyNotes.forEach(note => {
                const stickyNote = document.createElement('div');
                stickyNote.className = `sticky-note ${note.color}`;
                stickyNote.dataset.id = note.id;
                
                stickyNote.innerHTML = `
                    <div class="pin"></div>
                    ${note.title ? `<h4>${note.title}</h4>` : ''}
                    <div class="note-content">${note.content}</div>
                    <div class="note-date">${formatShortDate(note.createdAt)}</div>
                `;
                
                stickyNotesContainer.appendChild(stickyNote);
            });
        }
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    function formatShortDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }
});
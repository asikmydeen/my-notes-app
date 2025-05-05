class NotesApp {
    constructor() {
        this.notes = [];
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;

        // Initialize UI elements
        this.notesContainer = document.querySelector('.grid');
        this.recordButton = document.querySelector('.fa-microphone').parentElement;
        this.addButton = document.querySelector('.fa-plus').parentElement;
        this.searchButton = document.querySelector('.fa-search').parentElement;

        // Bind event listeners
        this.recordButton.addEventListener('click', () => this.handleRecording());
        this.addButton.addEventListener('click', () => this.showAddNoteDialog());
        this.searchButton.addEventListener('click', () => this.showSearchDialog());

        // Load initial notes
        this.loadNotes();
    }

    loadNotes() {
        this.notes = JSON.parse(localStorage.getItem('notes') || '[]');
        this.renderNotes();
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
        this.renderNotes();
    }

    renderNotes() {
        this.notesContainer.innerHTML = this.notes
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(note => `
                <div class="bg-surface p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                     onclick="app.showNoteDetail('${note.id}')">
                    <div class="flex items-center gap-2 mb-2">
                        ${note.hasAudio ? '<i class="fas fa-microphone text-primary"></i>' : ''}
                        <h3 class="text-lg font-semibold">${note.title || 'Untitled Note'}</h3>
                    </div>
                    <p class="text-gray-600 line-clamp-2">${note.content}</p>
                    <div class="text-sm text-gray-400 mt-2">
                        ${new Date(note.timestamp).toLocaleString()}
                    </div>
                </div>
            `).join('');
    }

    async handleRecording() {
        if (!this.isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioChunks = [];

                this.mediaRecorder.ondataavailable = (event) => {
                    this.audioChunks.push(event.data);
                };

                this.mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    this.showTranscriptionDialog(audioUrl);
                };

                this.mediaRecorder.start();
                this.isRecording = true;
                this.recordButton.classList.add('bg-error');
            } catch (error) {
                alert('Error accessing microphone. Please ensure you have granted permission.');
                console.error('Error:', error);
            }
        } else {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.recordButton.classList.remove('bg-error');
        }
    }

    showAddNoteDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
        dialog.innerHTML = `
            <div class="bg-surface p-6 rounded-lg w-full max-w-lg">
                <h2 class="text-xl font-bold mb-4">Add Note</h2>
                <input type="text" placeholder="Title (optional)" 
                       class="w-full p-2 mb-4 border rounded" id="noteTitle">
                <textarea placeholder="Note content..." 
                          class="w-full p-2 mb-4 border rounded h-32" id="noteContent"></textarea>
                <div class="flex justify-end gap-2">
                    <button class="px-4 py-2 rounded hover:bg-gray-100" onclick="this.closest('.fixed').remove()">
                        Cancel
                    </button>
                    <button class="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90" 
                            onclick="app.saveNote()">
                        Save
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
    }

    showTranscriptionDialog(audioUrl) {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
        dialog.innerHTML = `
            <div class="bg-surface p-6 rounded-lg w-full max-w-lg">
                <h2 class="text-xl font-bold mb-4">Voice Note</h2>
                <audio controls class="w-full mb-4">
                    <source src="${audioUrl}" type="audio/wav">
                </audio>
                <input type="text" placeholder="Title (optional)" 
                       class="w-full p-2 mb-4 border rounded" id="noteTitle">
                <textarea placeholder="Transcription will appear here... (You can edit this text)" 
                          class="w-full p-2 mb-4 border rounded h-32" id="noteContent"></textarea>
                <div class="flex justify-end gap-2">
                    <button class="px-4 py-2 rounded hover:bg-gray-100" onclick="this.closest('.fixed').remove()">
                        Cancel
                    </button>
                    <button class="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90" 
                            onclick="app.saveNote(true)">
                        Save
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
    }

    showSearchDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
        dialog.innerHTML = `
            <div class="bg-surface p-6 rounded-lg w-full max-w-lg">
                <h2 class="text-xl font-bold mb-4">Search Notes</h2>
                <input type="text" placeholder="Search..." 
                       class="w-full p-2 mb-4 border rounded" 
                       oninput="app.searchNotes(this.value)">
                <div id="searchResults" class="max-h-96 overflow-y-auto"></div>
                <div class="flex justify-end mt-4">
                    <button class="px-4 py-2 rounded hover:bg-gray-100" onclick="this.closest('.fixed').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
    }

    searchNotes(query) {
        const results = this.notes.filter(note =>
            note.title?.toLowerCase().includes(query.toLowerCase()) ||
            note.content?.toLowerCase().includes(query.toLowerCase())
        );

        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = results.length ? results.map(note => `
            <div class="p-2 hover:bg-gray-100 cursor-pointer rounded mb-2"
                 onclick="app.showNoteDetail('${note.id}')">
                <div class="font-semibold">${note.title || 'Untitled Note'}</div>
                <div class="text-sm text-gray-600 line-clamp-1">${note.content}</div>
            </div>
        `).join('') : '<div class="text-gray-500 text-center">No results found</div>';
    }

    showNoteDetail(id) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;

        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
        dialog.innerHTML = `
            <div class="bg-surface p-6 rounded-lg w-full max-w-lg">
                <h2 class="text-xl font-bold mb-4">${note.title || 'Untitled Note'}</h2>
                ${note.audioUrl ? `
                    <audio controls class="w-full mb-4">
                        <source src="${note.audioUrl}" type="audio/wav">
                    </audio>
                ` : ''}
                <p class="whitespace-pre-wrap mb-4">${note.content}</p>
                <div class="text-sm text-gray-400 mb-4">
                    Created: ${new Date(note.timestamp).toLocaleString()}
                </div>
                <div class="flex justify-end gap-2">
                    <button class="px-4 py-2 text-error rounded hover:bg-gray-100" 
                            onclick="app.deleteNote('${id}')">
                        Delete
                    </button>
                    <button class="px-4 py-2 rounded hover:bg-gray-100" 
                            onclick="this.closest('.fixed').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
    }

    saveNote(isVoiceNote = false) {
        const title = document.getElementById('noteTitle').value;
        const content = document.getElementById('noteContent').value;

        if (!content.trim()) {
            alert('Please enter some content for your note.');
            return;
        }

        const note = {
            id: Date.now().toString(),
            title: title.trim(),
            content: content.trim(),
            timestamp: new Date().toISOString(),
            hasAudio: isVoiceNote
        };

        this.notes.unshift(note);
        this.saveNotes();
        document.querySelector('.fixed').remove();
    }

    deleteNote(id) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(note => note.id !== id);
            this.saveNotes();
            document.querySelector('.fixed').remove();
        }
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NotesApp();
});

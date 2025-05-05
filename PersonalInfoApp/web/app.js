// Import dependencies
import { CONFIG } from './config.js';
import cloudService from './services/cloudService.js';
import aiService from './services/aiService.js';

class NotesApp {
    constructor() {
        this.notes = [];
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;

        // Initialize UI elements after DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeUI();
            this.loadNotes();
            this.initializeCloudSync();
        });
    }

    initializeUI() {
        // Initialize UI elements
        this.notesContainer = document.querySelector('.grid');
        this.recordButton = document.querySelector('.fa-microphone').parentElement;
        this.addButton = document.querySelector('.fa-plus').parentElement;
        this.searchButton = document.querySelector('.fa-search').parentElement;
        this.syncButton = document.getElementById('syncButton');

        // Bind event listeners
        this.recordButton.addEventListener('click', () => this.handleRecording());
        this.addButton.addEventListener('click', () => this.showAddNoteDialog());
        this.searchButton.addEventListener('click', () => this.showSearchDialog());
        this.syncButton.addEventListener('click', () => this.syncNotes());
    }

    async initializeCloudSync() {
        try {
            const authenticated = await cloudService.authenticate();
            if (authenticated) {
                this.syncButton.classList.remove('hidden');
                // Initial sync
                await this.syncNotes();
                // Set up periodic sync
                setInterval(() => this.syncNotes(), CONFIG.APP.SYNC_INTERVAL);
            }
        } catch (error) {
            console.error('Cloud sync initialization failed:', error);
        }
    }


    async syncNotes() {
        if (cloudService.isAuthenticated) {
            await cloudService.syncNotes(this.notes);
        }
    }

    async loadNotes() {
        try {
            this.notes = JSON.parse(localStorage.getItem('notes') || '[]');
            this.renderNotes();
        } catch (error) {
            console.error('Error loading notes:', error);
            this.notes = [];
        }
    }

    async saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
        this.renderNotes();
        await this.syncNotes();
    }

    renderNotes() {
        this.notesContainer.innerHTML = this.notes
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(note => this.renderNoteCard(note))
            .join('');
    }

    renderNoteCard(note) {
        return `
            <div class="bg-surface p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                 onclick="app.showNoteDetail('${note.id}')">
                <div class="flex items-center gap-2 mb-2">
                    ${note.hasAudio ? '<i class="fas fa-microphone text-primary"></i>' : ''}
                    <h3 class="text-lg font-semibold">${note.title || 'Untitled Note'}</h3>
                </div>
                <p class="text-gray-600 line-clamp-2">${note.content}</p>
                <div class="flex items-center justify-between mt-2">
                    <div class="text-sm text-gray-400">
                        ${new Date(note.timestamp).toLocaleString()}
                    </div>
                    ${note.tags ? this.renderTags(note.tags) : ''}
                </div>
            </div>
        `;
    }

    renderTags(tags) {
        return `
            <div class="flex gap-1">
                ${tags.map(tag => `
                    <span class="text-xs bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-full">
                        ${tag}
                    </span>
                `).join('')}
            </div>
        `;
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

                this.mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const transcription = await aiService.transcribeAudio(audioBlob);
                    this.showTranscriptionDialog(audioUrl, transcription);
                };

                this.mediaRecorder.start();
                this.isRecording = true;
                this.recordButton.classList.add('bg-error', 'recording-pulse');
            } catch (error) {
                alert('Error accessing microphone. Please ensure you have granted permission.');
                console.error('Error:', error);
            }
        } else {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.recordButton.classList.remove('bg-error', 'recording-pulse');
        }
    }

    showAddNoteDialog() {
        const dialog = this.createDialog('Add Note', this.renderAddNoteForm());
        document.body.appendChild(dialog);
    }

    renderAddNoteForm() {
        return `
            <input type="text" placeholder="Title (optional)" 
                   class="w-full p-2 mb-4 border rounded" id="noteTitle">
            <textarea placeholder="Note content..." 
                      class="w-full p-2 mb-4 border rounded h-32" id="noteContent"></textarea>
            <div class="flex justify-end gap-2">
                <button class="px-4 py-2 rounded hover:bg-gray-100" 
                        onclick="this.closest('.fixed').remove()">Cancel</button>
                <button class="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90" 
                        onclick="app.saveNote()">Save</button>
            </div>
        `;
    }

    async showTranscriptionDialog(audioUrl, transcription = '') {
        const dialog = this.createDialog('Voice Note', this.renderTranscriptionForm(audioUrl, transcription));
        document.body.appendChild(dialog);
    }

    renderTranscriptionForm(audioUrl, transcription) {
        return `
            <audio controls class="w-full mb-4">
                <source src="${audioUrl}" type="audio/wav">
            </audio>
            <input type="text" placeholder="Title (optional)" 
                   class="w-full p-2 mb-4 border rounded" id="noteTitle">
            <textarea placeholder="Transcription will appear here... (You can edit this text)" 
                      class="w-full p-2 mb-4 border rounded h-32" 
                      id="noteContent">${transcription}</textarea>
            <div class="flex justify-end gap-2">
                <button class="px-4 py-2 rounded hover:bg-gray-100" 
                        onclick="this.closest('.fixed').remove()">Cancel</button>
                <button class="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90" 
                        onclick="app.saveNote(true)">Save</button>
            </div>
        `;
    }

    createDialog(title, content) {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
        dialog.innerHTML = `
            <div class="bg-surface p-6 rounded-lg w-full max-w-lg">
                <h2 class="text-xl font-bold mb-4">${title}</h2>
                ${content}
            </div>
        `;
        return dialog;
    }

    showSearchDialog() {
        const dialog = this.createDialog('Search Notes', this.renderSearchForm());
        document.body.appendChild(dialog);
    }

    renderSearchForm() {
        return `
            <input type="text" placeholder="Search..." 
                   class="w-full p-2 mb-4 border rounded" 
                   oninput="app.searchNotes(this.value)">
            <div id="searchResults" class="max-h-96 overflow-y-auto"></div>
            <div class="flex justify-end mt-4">
                <button class="px-4 py-2 rounded hover:bg-gray-100" 
                        onclick="this.closest('.fixed').remove()">Close</button>
            </div>
        `;
    }

    async searchNotes(query) {
        const results = this.notes.filter(note =>
            note.title?.toLowerCase().includes(query.toLowerCase()) ||
            note.content?.toLowerCase().includes(query.toLowerCase()) ||
            note.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = results.length ? 
            results.map(note => this.renderSearchResult(note)).join('') : 
            '<div class="text-gray-500 text-center">No results found</div>';
    }

    renderSearchResult(note) {
        return `
            <div class="p-2 hover:bg-gray-100 cursor-pointer rounded mb-2"
                 onclick="app.showNoteDetail('${note.id}')">
                <div class="font-semibold">${note.title || 'Untitled Note'}</div>
                <div class="text-sm text-gray-600 line-clamp-1">${note.content}</div>
                ${note.tags ? this.renderTags(note.tags) : ''}
            </div>
        `;
    }

    async showNoteDetail(id) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;

        const summary = await aiService.summarizeNote(note.content);
        const relatedTopics = await aiService.suggestRelatedTopics(note.content);

        const dialog = this.createDialog(note.title || 'Untitled Note', 
            this.renderNoteDetail(note, summary, relatedTopics));
        document.body.appendChild(dialog);
    }

    renderNoteDetail(note, summary, relatedTopics) {
        return `
            <div class="max-h-[70vh] overflow-y-auto">
                ${note.audioUrl ? `
                    <audio controls class="w-full mb-4">
                        <source src="${note.audioUrl}" type="audio/wav">
                    </audio>
                ` : ''}
                <div class="mb-4">
                    <h3 class="font-semibold mb-2">Content:</h3>
                    <p class="whitespace-pre-wrap">${note.content}</p>
                </div>
                ${summary ? `
                    <div class="mb-4">
                        <h3 class="font-semibold mb-2">Summary:</h3>
                        <p class="text-gray-600">${summary}</p>
                    </div>
                ` : ''}
                ${relatedTopics ? `
                    <div class="mb-4">
                        <h3 class="font-semibold mb-2">Related Topics:</h3>
                        <p class="text-gray-600">${relatedTopics}</p>
                    </div>
                ` : ''}
                <div class="text-sm text-gray-400 mb-4">
                    Created: ${new Date(note.timestamp).toLocaleString()}
                </div>
                <div class="flex justify-end gap-2">
                    <button class="px-4 py-2 text-error rounded hover:bg-gray-100" 
                            onclick="app.deleteNote('${note.id}')">Delete</button>
                    <button class="px-4 py-2 rounded hover:bg-gray-100" 
                            onclick="this.closest('.fixed').remove()">Close</button>
                </div>
            </div>
        `;
    }

    async saveNote(isVoiceNote = false) {
        const title = document.getElementById('noteTitle').value;
        const content = document.getElementById('noteContent').value;

        if (!content.trim()) {
            alert('Please enter some content for your note.');
            return;
        }

        const tags = await aiService.generateTags(content);

        const note = {
            id: Date.now().toString(),
            title: title.trim(),
            content: content.trim(),
            timestamp: new Date().toISOString(),
            hasAudio: isVoiceNote,
            tags: tags
        };

        this.notes.unshift(note);
        await this.saveNotes();
        document.querySelector('.fixed').remove();
    }

    async deleteNote(id) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(note => note.id !== id);
            await this.saveNotes();
            document.querySelector('.fixed').remove();
        }
    }
}

// Create and export a single instance
const app = new NotesApp();
export default app;

// Also make it available globally
window.app = app;

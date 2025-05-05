import { CONFIG, ENDPOINTS } from '../config.js';

class CloudService {
    constructor() {
        this.isAuthenticated = false;
        this.accessToken = null;
        this.syncInProgress = false;
        this.lastSync = null;
        
        // Load the Google API client library
        this.loadGoogleApi();
    }

    async loadGoogleApi() {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => this.initializeGoogleApi();
        document.body.appendChild(script);
    }

    async initializeGoogleApi() {
        await new Promise(resolve => gapi.load('client:auth2', resolve));
        await gapi.client.init({
            apiKey: CONFIG.GOOGLE_CLOUD.API_KEY,
            clientId: CONFIG.GOOGLE_CLOUD.CLIENT_ID,
            scope: CONFIG.GOOGLE_CLOUD.SCOPES.join(' ')
        });

        // Check if user is already signed in
        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            this.isAuthenticated = true;
            this.accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
        }
    }

    async authenticate() {
        if (!this.isAuthenticated) {
            try {
                const googleAuth = gapi.auth2.getAuthInstance();
                const user = await googleAuth.signIn();
                this.isAuthenticated = true;
                this.accessToken = user.getAuthResponse().access_token;
                return true;
            } catch (error) {
                console.error('Authentication failed:', error);
                return false;
            }
        }
        return true;
    }

    async syncNotes(notes) {
        if (!this.isAuthenticated || this.syncInProgress) {
            return false;
        }

        this.syncInProgress = true;
        try {
            // Find or create app folder in Google Drive
            const appFolder = await this.findOrCreateAppFolder();
            
            // Get existing notes file or create new one
            const notesFile = await this.findOrCreateNotesFile(appFolder.id);
            
            // Update notes content
            await this.updateNotesContent(notesFile.id, notes);
            
            this.lastSync = new Date();
            this.syncInProgress = false;
            return true;
        } catch (error) {
            console.error('Sync failed:', error);
            this.syncInProgress = false;
            return false;
        }
    }

    async findOrCreateAppFolder() {
        const query = "name='PersonalInfoApp' and mimeType='application/vnd.google-apps.folder'";
        const response = await gapi.client.drive.files.list({
            q: query,
            fields: 'files(id, name)'
        });

        if (response.result.files.length > 0) {
            return response.result.files[0];
        }

        // Create new folder
        const fileMetadata = {
            name: 'PersonalInfoApp',
            mimeType: 'application/vnd.google-apps.folder'
        };

        const folder = await gapi.client.drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        });

        return folder.result;
    }

    async findOrCreateNotesFile(folderId) {
        const query = `name='notes.json' and '${folderId}' in parents`;
        const response = await gapi.client.drive.files.list({
            q: query,
            fields: 'files(id, name, modifiedTime)'
        });

        if (response.result.files.length > 0) {
            return response.result.files[0];
        }

        // Create new file
        const fileMetadata = {
            name: 'notes.json',
            parents: [folderId]
        };

        const file = await gapi.client.drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        });

        return file.result;
    }

    async updateNotesContent(fileId, notes) {
        const content = JSON.stringify(notes, null, 2);
        const blob = new Blob([content], { type: 'application/json' });

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify({
            name: 'notes.json',
            mimeType: 'application/json'
        })], { type: 'application/json' }));
        form.append('file', blob);

        await fetch(`${ENDPOINTS.GOOGLE_DRIVE}/files/${fileId}?uploadType=multipart`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            },
            body: form
        });
    }

    async downloadNotes() {
        if (!this.isAuthenticated) {
            return null;
        }

        try {
            const appFolder = await this.findOrCreateAppFolder();
            const notesFile = await this.findOrCreateNotesFile(appFolder.id);
            
            const response = await fetch(
                `${ENDPOINTS.GOOGLE_DRIVE}/files/${notesFile.id}?alt=media`,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to download notes');
            }

            const notes = await response.json();
            this.lastSync = new Date();
            return notes;
        } catch (error) {
            console.error('Download failed:', error);
            return null;
        }
    }

    getLastSyncTime() {
        return this.lastSync;
    }

    isAuthenticated() {
        return this.isAuthenticated;
    }
}

export default new CloudService();

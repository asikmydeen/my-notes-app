const CONFIG = {
    // Google Cloud Configuration
    GOOGLE_CLOUD: {
        API_KEY: 'YOUR_API_KEY', // Replace with your Google Cloud API key
        CLIENT_ID: 'YOUR_CLIENT_ID', // Replace with your Google OAuth client ID
        SCOPES: [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.appdata'
        ]
    },
    
    // OpenAI Configuration for AI features
    OPENAI: {
        API_KEY: 'YOUR_OPENAI_API_KEY', // Replace with your OpenAI API key
        MODEL: 'gpt-3.5-turbo', // OpenAI model to use
        MAX_TOKENS: 500
    },

    // Application Settings
    APP: {
        SYNC_INTERVAL: 5 * 60 * 1000, // Sync every 5 minutes
        MAX_NOTE_LENGTH: 10000,
        CACHE_DURATION: 24 * 60 * 60 * 1000 // Cache for 24 hours
    }
};

// Service endpoints
const ENDPOINTS = {
    GOOGLE_DRIVE: 'https://www.googleapis.com/drive/v3',
    OPENAI: 'https://api.openai.com/v1'
};

export { CONFIG, ENDPOINTS };

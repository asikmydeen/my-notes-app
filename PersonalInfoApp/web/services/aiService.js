import { CONFIG, ENDPOINTS } from '../config.js';

class AIService {
    constructor() {
        this.apiKey = CONFIG.OPENAI.API_KEY;
        this.model = CONFIG.OPENAI.MODEL;
        this.maxTokens = CONFIG.OPENAI.MAX_TOKENS;
    }

    async summarizeNote(noteContent) {
        try {
            // For demo purposes, return a simulated summary
            // In production, implement actual OpenAI API calls
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
            return `This is a simulated AI summary of your note: "${noteContent.substring(0, 50)}..."`;
        } catch (error) {
            console.error('Summarization failed:', error);
            return null;
        }
    }

    async generateTags(noteContent) {
        try {
            // For demo purposes, generate simple tags
            // In production, implement actual OpenAI API calls
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
            const words = noteContent.toLowerCase().split(/\W+/).filter(word => word.length > 4);
            const uniqueWords = [...new Set(words)];
            return uniqueWords.slice(0, 3).map(word => word.charAt(0).toUpperCase() + word.slice(1));
        } catch (error) {
            console.error('Tag generation failed:', error);
            return [];
        }
    }

    async suggestRelatedTopics(noteContent) {
        try {
            // For demo purposes, return simulated suggestions
            // In production, implement actual OpenAI API calls
            await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay
            return "Related topics might include:\n- Topic 1\n- Topic 2\n- Topic 3";
        } catch (error) {
            console.error('Topic suggestion failed:', error);
            return null;
        }
    }

    async transcribeAudio(audioBlob) {
        try {
            // For demo purposes, return a simulated transcription
            // In production, implement actual OpenAI Whisper API calls
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
            return "This is a simulated transcription of your voice note. In production, this would be actual transcribed text from the audio recording.";
        } catch (error) {
            console.error('Transcription failed:', error);
            return null;
        }
    }
}

// Create and export a single instance
const aiService = new AIService();
export default aiService;

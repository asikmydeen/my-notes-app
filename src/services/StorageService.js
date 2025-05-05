import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_STORAGE_KEY } from '../config/constants';

class StorageService {
  async getAllNotes() {
    try {
      const notes = await AsyncStorage.getItem(`${APP_STORAGE_KEY}_notes`);
      return notes ? JSON.parse(notes) : [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  async addNote(note) {
    try {
      const notes = await this.getAllNotes();
      const newNote = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...note
      };
      notes.push(newNote);
      await AsyncStorage.setItem(`${APP_STORAGE_KEY}_notes`, JSON.stringify(notes));
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  async updateNote(id, updatedNote) {
    try {
      const notes = await this.getAllNotes();
      const index = notes.findIndex(note => note.id === id);
      if (index !== -1) {
        notes[index] = { ...notes[index], ...updatedNote };
        await AsyncStorage.setItem(`${APP_STORAGE_KEY}_notes`, JSON.stringify(notes));
        return notes[index];
      }
      throw new Error('Note not found');
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(id) {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter(note => note.id !== id);
      await AsyncStorage.setItem(`${APP_STORAGE_KEY}_notes`, JSON.stringify(filteredNotes));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  async searchNotes(query) {
    try {
      const notes = await this.getAllNotes();
      return notes.filter(note => 
        note.title?.toLowerCase().includes(query.toLowerCase()) ||
        note.content?.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  }
}

export default new StorageService();

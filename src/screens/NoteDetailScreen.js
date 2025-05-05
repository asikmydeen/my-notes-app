import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, IconButton, Portal, Dialog, Text, FAB } from 'react-native-paper';
import { SCREENS, THEME } from '../config/constants';
import StorageService from '../services/StorageService';
import VoiceService from '../services/VoiceService';

const NoteDetailScreen = ({ route, navigation }) => {
  const { noteId } = route.params;
  const [note, setNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNote();
  }, [noteId]);

  const loadNote = async () => {
    try {
      const notes = await StorageService.getAllNotes();
      const foundNote = notes.find(n => n.id === noteId);
      if (foundNote) {
        setNote(foundNote);
        setTitle(foundNote.title);
        setContent(foundNote.content);
      } else {
        setError('Note not found');
      }
    } catch (error) {
      console.error('Error loading note:', error);
      setError('Failed to load note');
    }
  };

  const handleSave = async () => {
    try {
      await StorageService.updateNote(noteId, {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
      });
      setIsEditing(false);
      loadNote();
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Failed to save note');
    }
  };

  const handleDelete = async () => {
    try {
      await StorageService.deleteNote(noteId);
      navigation.navigate(SCREENS.HOME);
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note');
    }
  };

  const handlePlayAudio = async () => {
    if (!note?.audioUri) return;
    try {
      setIsPlaying(true);
      await VoiceService.playRecording(note.audioUri);
      setIsPlaying(false);
    } catch (error) {
      console.error('Error playing audio:', error);
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  };

  const handleStopAudio = async () => {
    try {
      await VoiceService.stopPlaying();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error stopping audio:', error);
      setError('Failed to stop audio');
    }
  };

  if (!note) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          disabled={!isEditing}
          style={styles.titleInput}
        />

        {note.audioUri && (
          <View style={styles.audioContainer}>
            <IconButton
              icon={isPlaying ? 'stop' : 'play'}
              size={30}
              onPress={isPlaying ? handleStopAudio : handlePlayAudio}
            />
            <Text>Voice Note Recording</Text>
          </View>
        )}

        <TextInput
          label="Content"
          value={content}
          onChangeText={setContent}
          mode="outlined"
          multiline
          numberOfLines={20}
          disabled={!isEditing}
          style={styles.contentInput}
        />
      </ScrollView>

      <FAB
        icon={isEditing ? 'check' : 'pencil'}
        style={styles.fab}
        onPress={() => {
          if (isEditing) {
            handleSave();
          } else {
            setIsEditing(true);
          }
        }}
      />

      <Portal>
        <Dialog visible={!!error} onDismiss={() => setError(null)}>
          <Dialog.Title>Error</Dialog.Title>
          <Dialog.Content>
            <Text>{error}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setError(null)}>OK</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Delete Note</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this note?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button onPress={handleDelete} textColor={THEME.colors.error}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {!isEditing && (
        <Button
          icon="delete"
          mode="contained"
          onPress={() => setShowDeleteDialog(true)}
          style={styles.deleteButton}
          textColor="white"
        >
          Delete Note
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    marginBottom: 16,
    backgroundColor: THEME.colors.surface,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 16,
    backgroundColor: THEME.colors.surface,
    borderRadius: 8,
    elevation: 2,
  },
  contentInput: {
    backgroundColor: THEME.colors.surface,
    minHeight: 200,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: THEME.colors.primary,
  },
  deleteButton: {
    margin: 16,
    backgroundColor: THEME.colors.error,
  },
});

export default NoteDetailScreen;

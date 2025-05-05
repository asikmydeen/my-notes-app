import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Snackbar } from 'react-native-paper';
import { SCREENS, THEME } from '../config/constants';
import StorageService from '../services/StorageService';

const AddNoteScreen = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async () => {
    if (!content.trim()) {
      setErrorMessage('Note content cannot be empty');
      setSnackbarVisible(true);
      return;
    }

    try {
      setSaving(true);
      const note = {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
      };
      
      await StorageService.addNote(note);
      navigation.navigate(SCREENS.HOME);
    } catch (error) {
      console.error('Error saving note:', error);
      setErrorMessage('Failed to save note. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <TextInput
          label="Title (optional)"
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
          mode="outlined"
          placeholder="Enter note title..."
        />
        <TextInput
          label="Note Content"
          value={content}
          onChangeText={setContent}
          style={styles.contentInput}
          mode="outlined"
          multiline
          numberOfLines={10}
          placeholder="Start typing your note..."
        />
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        >
          Save Note
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {errorMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    marginBottom: 16,
    backgroundColor: THEME.colors.surface,
  },
  contentInput: {
    backgroundColor: THEME.colors.surface,
    minHeight: 200,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: THEME.colors.surface,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: THEME.colors.primary,
  },
  snackbar: {
    backgroundColor: THEME.colors.error,
  },
});

export default AddNoteScreen;

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, Text, Portal, Dialog, ActivityIndicator } from 'react-native-paper';
import { SCREENS, THEME } from '../config/constants';
import VoiceService from '../services/VoiceService';
import StorageService from '../services/StorageService';

const VoiceNoteScreen = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Set up voice recognition callback
    VoiceService.setTranscriptionCallback((result) => {
      setTranscription(current => current + ' ' + result);
    });

    return () => {
      VoiceService.destroy();
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      setError(null);
      await VoiceService.startRecording();
      await VoiceService.startRecognizing();
      setIsRecording(true);
    } catch (error) {
      setError('Failed to start recording. Please check permissions.');
      console.error('Recording error:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const uri = await VoiceService.stopRecording();
      await VoiceService.stopRecognizing();
      setAudioUri(uri);
      setIsRecording(false);
    } catch (error) {
      setError('Failed to stop recording.');
      console.error('Stop recording error:', error);
    }
  };

  const handlePlayRecording = async () => {
    if (!audioUri) return;
    try {
      setIsPlaying(true);
      await VoiceService.playRecording(audioUri);
      setIsPlaying(false);
    } catch (error) {
      setError('Failed to play recording.');
      setIsPlaying(false);
    }
  };

  const handleStopPlaying = async () => {
    try {
      await VoiceService.stopPlaying();
      setIsPlaying(false);
    } catch (error) {
      setError('Failed to stop playback.');
    }
  };

  const handleSave = async () => {
    if (!transcription.trim() && !audioUri) {
      setError('No recording or transcription to save.');
      return;
    }

    try {
      setSaving(true);
      const note = {
        title: title.trim() || 'Voice Note',
        content: transcription.trim(),
        audioUri: audioUri,
        type: 'voice'
      };
      
      await StorageService.addNote(note);
      navigation.navigate(SCREENS.HOME);
    } catch (error) {
      setError('Failed to save note. Please try again.');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Title (optional)"
        value={title}
        onChangeText={setTitle}
        style={styles.titleInput}
        mode="outlined"
        disabled={isRecording}
      />

      <View style={styles.recordingContainer}>
        <Text style={styles.status}>
          {isRecording ? 'Recording...' : 'Ready to record'}
        </Text>

        <View style={styles.buttonGroup}>
          {!isRecording ? (
            <Button
              mode="contained"
              icon="microphone"
              onPress={handleStartRecording}
              style={styles.button}
              disabled={saving}
            >
              Start Recording
            </Button>
          ) : (
            <Button
              mode="contained"
              icon="stop"
              onPress={handleStopRecording}
              style={[styles.button, { backgroundColor: THEME.colors.error }]}
            >
              Stop Recording
            </Button>
          )}

          {audioUri && !isRecording && (
            <Button
              mode="outlined"
              icon={isPlaying ? 'stop' : 'play'}
              onPress={isPlaying ? handleStopPlaying : handlePlayRecording}
              style={styles.button}
            >
              {isPlaying ? 'Stop Playing' : 'Play Recording'}
            </Button>
          )}
        </View>
      </View>

      <TextInput
        label="Transcription"
        value={transcription}
        onChangeText={setTranscription}
        multiline
        numberOfLines={8}
        mode="outlined"
        style={styles.transcriptionInput}
        disabled={isRecording}
      />

      <View style={styles.saveContainer}>
        <Button
          mode="contained"
          onPress={handleSave}
          disabled={isRecording || saving || (!transcription.trim() && !audioUri)}
          loading={saving}
          style={styles.saveButton}
        >
          Save Note
        </Button>
      </View>

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
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: THEME.colors.background,
  },
  titleInput: {
    marginBottom: 16,
    backgroundColor: THEME.colors.surface,
  },
  recordingContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    backgroundColor: THEME.colors.surface,
    borderRadius: 8,
    elevation: 2,
  },
  status: {
    fontSize: 18,
    marginBottom: 16,
    color: THEME.colors.primary,
  },
  buttonGroup: {
    width: '100%',
    gap: 10,
  },
  button: {
    marginVertical: 8,
  },
  transcriptionInput: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
  },
  saveContainer: {
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: THEME.colors.primary,
  },
});

export default VoiceNoteScreen;

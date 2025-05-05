import { Audio } from 'expo-av';
import Voice from '@react-native-voice/voice';

class VoiceService {
  constructor() {
    this.recording = null;
    this.sound = null;
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
  }

  async startRecording() {
    try {
      // Request permissions
      const permissionResponse = await Audio.requestPermissionsAsync();
      if (permissionResponse.status !== 'granted') {
        throw new Error('Permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording() {
    try {
      if (!this.recording) {
        return null;
      }
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  async playRecording(uri) {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      this.sound = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play recording:', error);
      throw error;
    }
  }

  async stopPlaying() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('Failed to stop playing:', error);
      throw error;
    }
  }

  // Voice recognition methods
  async startRecognizing() {
    try {
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      throw error;
    }
  }

  async stopRecognizing() {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      throw error;
    }
  }

  onSpeechResults(event) {
    if (this.onTranscriptionResult) {
      this.onTranscriptionResult(event.value[0]);
    }
  }

  onSpeechError(error) {
    console.error('Speech recognition error:', error);
  }

  setTranscriptionCallback(callback) {
    this.onTranscriptionResult = callback;
  }

  destroy() {
    if (this.recording) {
      this.recording.stopAndUnloadAsync();
    }
    if (this.sound) {
      this.sound.unloadAsync();
    }
    Voice.destroy().then(Voice.removeAllListeners);
  }
}

export default new VoiceService();

import { Audio } from 'expo-av';

// Define songs with correct paths
const songs = [
  {
    id: 'no-debes-pensar',
    title: 'No Debes Pensar En Mi',
    artist: 'Alma Morena',
    // Updated paths to match project structure
    audio: require('../assets/canciones/no-debes-pensar.mp3'),
    image: require('../assets/images/alma1.jpeg')
  },
  {
    id: 'quiero-darte-amor',
    title: 'Quiero Darte Amor',
    artist: 'Alma Morena',
    audio: require('../assets/canciones/quiero-darte-amor.mp3'),
    image: require('../assets/images/alma2.jpg')
  }
];

class AudioManager {
  constructor() {
    this.sound = null;
    this.isLoaded = false;
    this.songsList = songs;
    this._initializeAudio();
  }

  async _initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  async loadAudio(songId) {
    try {
      await this.unloadSound();

      const song = this.songsList.find(s => s.id === songId);
      if (!song) {
        throw new Error(`Song not found: ${songId}`);
      }

      console.log('Loading audio:', song.title);
      const { sound, status } = await Audio.Sound.createAsync(
        song.audio,
        { shouldPlay: false },
        this._onPlaybackStatusUpdate
      );

      this.sound = sound;
      this.isLoaded = true;
      return { sound, status };
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    }
  }

  async unloadSound() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        this.isLoaded = false;
      } catch (error) {
        console.error('Error unloading sound:', error);
      }
    }
  }

  setSongsList(songs) {
    this.songsList = songs;
  }

  _onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      this.onSongComplete && this.onSongComplete();
    }
  };

  async playSound() {
    if (this.sound) {
      try {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) {
          await this.sound.playAsync();
        }
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  }

  async pauseSound() {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async seekTo(position) {
    if (this.sound) {
      await this.sound.setPositionAsync(position * 1000);
    }
  }

  setOnComplete(callback) {
    this.onSongComplete = callback;
  }
}

export { songs };
export default new AudioManager();
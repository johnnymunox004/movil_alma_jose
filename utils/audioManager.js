import { Audio } from 'expo-av';

const audioFiles = {
  'no-debes-pensar': require('../app/assets/Alma Morena - No Debes Pensar En Mi.mp3'),
  'quiero-darte-amor': require('../app/assets/Alma Morena - Quiero Darte Amor [ivsKaVh-WNM].mp3'),
};

const songTitles = {
  'no-debes-pensar': 'No Debes Pensar En Mi',
  'quiero-darte-amor': 'Quiero Darte Amor',
};

const songsList = [
  { id: 'no-debes-pensar', title: 'No Debes Pensar En Mi' },
  { id: 'quiero-darte-amor', title: 'Quiero Darte Amor' },
];

class AudioManager {
  constructor() {
    this.sound = null;
    this.isPlaying = false;
    this.currentSong = null;
  }

  async loadAudio(songKey) {
    try {
      console.log('Loading audio for songKey:', songKey); // Agrega este log
      if (!audioFiles[songKey]) {
        throw new Error(`Audio file for songKey "${songKey}" not found`);
      }
      if (this.sound) {
        await this.sound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(audioFiles[songKey]);
      this.sound = sound;
      this.currentSong = songKey;
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  }

  async playSound() {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        this.isPlaying = true;
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  async pauseSound() {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  }

  async stopSound() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }

  getAllSongs() {
    return Object.keys(audioFiles).map(key => ({
      id: key,
      title: songTitles[key],
      artist: 'Alma Morena'
    }));
  }
}

const loadSong = async (index) => {
  const songKey = songsList[index].id;
  console.log('Loading song with key:', songKey); // Agrega este log
  await audioManager.loadAudio(songKey);
  setSongIndex(index);
  const status = await audioManager.getStatus();
  setDuration(status?.durationMillis || 0);
};

export default new AudioManager();
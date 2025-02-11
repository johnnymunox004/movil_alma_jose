import { Audio } from 'expo-av';

class AudioController {
  // Añadir manejo de buffer
  async loadAudio(uri) {
    try {
      this.setLoading(true);
      const { sound } = await Audio.Sound.createAsync(
        uri,
        { shouldPlay: false, progressUpdateIntervalMillis: 100 },
        this.onPlaybackStatusUpdate
      );
      // ...resto del código
    } catch (error) {
      this.setError(error);
    }
  }
}

// En MusicPlayer.js
const handlePlayPause = async () => {
  try {
    if (!AudioController.isLoaded) {
      await loadAndPlaySong();
      return;
    }
    
    if (isPlaying) {
      await AudioController.sound.pauseAsync();
    } else {
      await AudioController.sound.playAsync();
    }
    setIsPlaying(!isPlaying);
  } catch (error) {
    console.error('Error en reproducción:', error);
  }
};
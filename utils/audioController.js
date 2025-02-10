import { Audio } from 'expo-av';

export const loadAudio = async (audioPath) => {
  try {
    const sound = new Audio.Sound();
    await sound.loadAsync(require(audioPath));
    return sound;
  } catch (error) {
    console.error('Error loading audio:', error);
  }
}; 
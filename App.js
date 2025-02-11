import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import MusicPlayer from './components/MusicPlayer';

function App() {
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        setIsAudioReady(true);
      } catch (error) {
        console.error('Error setting up audio:', error);
        setError(error);
      }
    };

    setupAudio();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  if (!isAudioReady) {
    return (
      <View style={styles.container}>
        <Text>Loading audio system...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <MusicPlayer />
    </NavigationContainer>
  );
}

registerRootComponent(App);

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
};

export default App;
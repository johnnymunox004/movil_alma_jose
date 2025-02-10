import React, { useRef, useEffect, useState } from 'react';
import { 
  Dimensions, 
  Platform, 
  View, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  Text, 
  Image,
  Modal,
  Pressable 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import audioManager from '../utils/audioManager';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Modifica la lista de canciones para que coincida con los IDs en audioManager.js
const songsList = [
  {
    id: 'no-debes-pensar',
    title: 'No Debes Pensar En Mi',
    artist: 'Alma Morena',
    image: require('../app/assets/alma1.jpeg'),
    audio: require('../app/assets/Alma Morena - No Debes Pensar En Mi.mp3')
  },
  {
    id: 'quiero-darte-amor',
    title: 'Quiero Darte Amor',
    artist: 'Alma Morena',
    image: require('../app/assets/alma2.jpg'),
    audio: require('../app/assets/Alma Morena - Quiero Darte Amor [ivsKaVh-WNM].mp3')
  }
];

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [currentSong] = useState(songsList[currentSongIndex]);
  const [songIndex, setSongIndex] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);

  useEffect(() => {
    loadSong(songIndex);
    if (isPlaying) {
      startRotation();
      startProgressAnimation();
    } else {
      rotateAnim.stopAnimation();
    }
  }, [isPlaying, songIndex]);

  const loadSong = async (index) => {
    const song = songsList[index];
    console.log('Loading song with key:', song.id);
    try {
      await audioManager.loadAudio(song.id);
      setSongIndex(index);
      if (isPlaying) {
        await audioManager.playSound();
      }
    } catch (error) {
      console.error('Error loading song:', error);
    }
  };

  const startRotation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 6000, // Aumentamos la duración para un giro más suave
        easing: Animated.linear, // Agregamos linear para un movimiento constante
        useNativeDriver: true,
      })
    ).start();
  };

  const startProgressAnimation = () => {
    setProgress(0);
    Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration: 180000, // 3 minutos
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && isPlaying) {
        handleNext();
      }
    });
  };

  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlaying) {
      await audioManager.pauseSound();
      rotateAnim.stopAnimation(); // Detenemos la animación
    } else {
      await audioManager.playSound();
      startRotation(); // Reiniciamos la rotación
    }
    setIsPlaying(!isPlaying);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nextIndex = (songIndex + 1) % songsList.length;
    await loadSong(nextIndex);
    setSongIndex(nextIndex);
    setIsPlaying(true);
    setProgress(0);
  };

  const handlePrevious = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const prevIndex = (songIndex - 1 + songsList.length) % songsList.length;
    await loadSong(prevIndex);
    setSongIndex(prevIndex);
    setIsPlaying(true);
    setProgress(0);
  };

  const toggleShuffle = () => {
    setIsShuffleOn(!isShuffleOn);
  };

  const toggleRepeat = () => {
    setIsRepeatOn(!isRepeatOn);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#000000', '#FF4500', '#FFA500']}
      style={styles.container}
    >
      <SafeAreaView style={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="chevron-down" size={isSmallDevice ? 24 : 30} color="#FFA500" />
          </TouchableOpacity>
          <Text style={styles.headerText}>REPRODUCIENDO AHORA</Text>
          <TouchableOpacity onPress={() => {
            setModalVisible(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}>
            <Ionicons name="ellipsis-horizontal" size={isSmallDevice ? 24 : 30} color="#FFA500" />
          </TouchableOpacity>
        </View>

        <Animated.View style={[
          styles.albumContainer,
          {
            transform: [
              { rotate: spin },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <View style={styles.vinyl}>
            <View style={styles.vinylRings}>
              <View style={styles.vinylRing1} />
              <View style={styles.vinylRing2} />
              <View style={styles.vinylRing3} />
              <View style={styles.vinylCenter} />
            </View>
            <View style={styles.albumArtContainer}>
              <Image
                source={currentSong.image}
                style={styles.albumArt}
              />
            </View>
          </View>
        </Animated.View>

        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{currentSong.title}</Text>
          <Text style={styles.artistName}>{currentSong.artist}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePrevious}>
            <Ionicons name="play-skip-back" size={35} color="#FFA500" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext}>
            <Ionicons name="play-skip-forward" size={35} color="#FFA500" />
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.modalOption}>
                <Ionicons name="heart-outline" size={24} color="#FFA500" />
                <Text style={styles.modalText}>Agregar a favoritos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption}>
                <Ionicons name="share-outline" size={24} color="#FFA500" />
                <Text style={styles.modalText}>Compartir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption}>
                <Ionicons name="add-outline" size={24} color="#FFA500" />
                <Text style={styles.modalText}>Agregar a playlist</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const vinylSize = width * 0.8;
const vinylRadius = vinylSize / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 15 : 20,
    height: isSmallDevice ? 40 : 50,
  },
  headerText: {
    color: '#FFA500',
    fontSize: isSmallDevice ? 10 : 12,
    fontWeight: 'bold',
  },
  albumContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: vinylSize,
    height: vinylSize,
    alignSelf: 'center',
    marginVertical: 20,
  },
  vinyl: {
    width: vinylSize,
    height: vinylSize,
    borderRadius: vinylRadius,
    backgroundColor: '#171717',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden', // Asegura que el contenido no se salga del círculo
  },
  vinylRings: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vinylRing1: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: vinylRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  vinylRing2: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    borderRadius: vinylRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  vinylRing3: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    borderRadius: vinylRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  vinylCenter: {
    position: 'absolute',
    width: vinylSize * 0.08,
    height: vinylSize * 0.08,
    borderRadius: (vinylSize * 0.08) / 2,
    backgroundColor: '#FFA500',
    borderWidth: 2,
    borderColor: '#333333',
  },
  albumArtContainer: {
    width: vinylSize * 0.45,
    height: vinylSize * 0.45,
    borderRadius: (vinylSize * 0.45) / 2,
    overflow: 'hidden',
    position: 'absolute',
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  albumArt: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  songInfo: {
    alignItems: 'center',
    marginVertical: isSmallDevice ? 10 : 20,
  },
  songTitle: {
    color: '#ffffff',
    fontSize: isSmallDevice ? 18 : 24,
    fontWeight: 'bold',
    marginBottom: isSmallDevice ? 3 : 5,
  },
  artistName: {
    color: '#FFA500',
    fontSize: isSmallDevice ? 14 : 18,
  },
  controlsContainer: {
    paddingBottom: height * 0.05,
  },
  progressContainer: {
    paddingHorizontal: isSmallDevice ? 15 : 20,
    marginBottom: isSmallDevice ? 10 : 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#4f4f4f',
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    backgroundColor: '#FFA500',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 5,
  },
  timeText: {
    color: '#FFA500',
    fontSize: isSmallDevice ? 10 : 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginVertical: isSmallDevice ? 10 : 20,
  },
  controlButton: {
    padding: isSmallDevice ? 8 : 10,
  },
  playButton: {
    backgroundColor: '#FFA500',
    padding: isSmallDevice ? 15 : 20,
    borderRadius: isSmallDevice ? 35 : 40,
  },
  modalView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalText: {
    color: '#FFA500',
    fontSize: 16,
    marginLeft: 15,
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FF4500',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFA500',
    borderRadius: 2,
  },
});

export default MusicPlayer;
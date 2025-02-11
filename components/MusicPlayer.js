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
import { useNavigation } from '@react-navigation/native';
import { songs as songsList } from '../config/songs';
import { Audio } from 'expo-av';  // Añade esta importación

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

const MusicPlayer = () => {
  const navigation = useNavigation();
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
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;

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
      rotateAnim.stopAnimation(); // Detenemos la animación      const rotation = new Animated.Value(0);      import { Animated, Easing } from 'react-native';
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    const setupAudio = async () => {
      try {
        const { sound, status } = await audioManager.loadAudio(currentSong.id);
        setTotalDuration(status.durationMillis / 1000);
        
        // Configurar el callback de estado
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setCurrentTime(status.positionMillis / 1000);
            setProgress(status.positionMillis / status.durationMillis);
          }
        });
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };

    setupAudio();
  }, [currentSong]);

  // Añade un log para debuggear
  console.log('Current song object:', currentSong);

  // Modifica la función loadAudio para incluir mejor manejo de errores
  const loadAudio = async (audioSource) => {
    if (!audioSource) {
      console.error('Audio source is undefined');
      return null;
    }

    try {
      const { sound, status } = await Audio.Sound.createAsync(
        // Asegúrate de que el audio source es un require o uri válido
        typeof audioSource === 'string' ? { uri: audioSource } : audioSource,
        { shouldPlay: false },
        (status) => {
          console.log('Playback status:', status);
        }
      );
      return { sound, status };
    } catch (error) {
      console.error('Error details:', error);
      return null;
    }
  };

  useEffect(() => {
    // Diagnóstico
    const checkAudio = async () => {
      try {
        console.log('Checking audio capabilities...');
        // Verifica que Audio está importado correctamente
        if (!Audio) {
          throw new Error('Audio module not available');
        }
        
        const audioStatus = await Audio.getPermissionsAsync();
        console.log('Audio permissions:', audioStatus);
        
        // Configura el modo de audio
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
        console.log('Audio mode configured successfully');
      } catch (error) {
        console.error('Diagnostic error:', error);
      }
    };

    checkAudio();
  }, []);

  useEffect(() => {
    // Configura la lista de canciones en el audioManager
    audioManager.setSongsList(songsList);
    
    // Carga la primera canción
    const loadInitialSong = async () => {
      try {
        await loadSong(0);
      } catch (error) {
        console.error('Error loading initial song:', error);
      }
    };

    loadInitialSong();

    // Limpieza al desmontar el componente
    return async () => {
      if (audioManager) {
        await audioManager.unloadSound();
      }
    };
  }, []);

  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
    Animated.spring(slideAnim, {
      toValue: isPanelVisible ? -300 : 0,
      useNativeDriver: true,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <LinearGradient
      colors={['#000000', '#FF4500', '#FFA500']}
      style={styles.container}
    >
      <SafeAreaView style={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={togglePanel}
          >
            <Ionicons 
              name={isPanelVisible ? "chevron-up" : "chevron-down"} 
              size={isSmallDevice ? 24 : 30} 
              color="#FFA500" 
            />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.slidePanel,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.panelContent}>
              <Text style={styles.panelTitle}>Tu Biblioteca</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{songsList.length}</Text>
                  <Text style={styles.statLabel}>Canciones</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>1</Text>
                  <Text style={styles.statLabel}>Artista</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatTime(totalDuration)}</Text>
                  <Text style={styles.statLabel}>Duración</Text>
                </View>
              </View>
              <View style={styles.currentlyPlaying}>
                <Text style={styles.nowPlayingText}>Reproduciendo ahora:</Text>
                <Text style={styles.currentSongText}>{currentSong.title}</Text>
              </View>
            </View>
          </Animated.View>

          <TouchableOpacity 
            style={[styles.headerButton, { flexDirection: 'row' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
         
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
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
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
    marginTop: 5,
  },
  timeText: {
    color: '#FFA500',
    fontSize: 12,
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
  headerButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  miniText: {
    color: '#FFA500',
    fontSize: 10,
    marginTop: 2,
  },
  miniPlayer: {
    marginLeft: 10,
  },
  miniTitle: {
    color: '#FFA500',
    fontSize: 12,
    fontWeight: 'bold',
  },
  miniSubtitle: {
    color: '#FFA500',
    fontSize: 10,
    opacity: 0.8,
  },
  headerInfo: {
    marginLeft: 8,
  },
  headerMainText: {
    color: '#FFA500',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerSubText: {
    color: '#FFA500',
    fontSize: 10,
    opacity: 0.7,
  },
  slidePanel: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 20,
    padding: 20,
    margin: 10,
    zIndex: 1000,
  },
  panelContent: {
    alignItems: 'center',
  },
  panelTitle: {
    color: '#FFA500',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFA500',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#FFA500',
    fontSize: 12,
    opacity: 0.7,
  },
  currentlyPlaying: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderRadius: 10,
    width: '100%',
  },
  nowPlayingText: {
    color: '#FFA500',
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 5,
  },
  currentSongText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MusicPlayer;
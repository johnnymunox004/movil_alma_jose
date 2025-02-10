import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import audioManager from '../utils/audioManager';

export default function PlayList({ onSongSelect }) {
  const songs = audioManager.getAllSongs();

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.songItem}
      onPress={() => onSongSelect(item.id)}
    >
      <Ionicons name="musical-note" size={24} color="#FFA500" />
      <Text style={styles.songTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={songs}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
}); 
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const events = [
  {
    id: '1',
    title: 'Concierto en Vivo',
    date: '15 Mayo 2024',
    location: 'Teatro Principal'
  },
  // Añade más eventos aquí
];

export default function Events() {
  return (
    <LinearGradient
      colors={['#000000', '#FF4500', '#FFA500']}
      style={styles.container}
    >
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDetails}>{item.date}</Text>
            <Text style={styles.eventDetails}>{item.location}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  eventCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  eventTitle: {
    color: '#FFA500',
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventDetails: {
    color: '#fff',
    fontSize: 16,
  },
}); 
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Contact() {
  return (
    <LinearGradient
      colors={['#000000', '#FF4500', '#FFA500']}
      style={styles.container}
    >
      <View style={styles.contactCard}>
        <Text style={styles.title}>Contáctanos</Text>
        
        <TouchableOpacity 
          style={styles.contactItem}
          onPress={() => Linking.openURL('mailto:ejemplo@email.com')}
        >
          <Ionicons name="mail" size={24} color="#FFA500" />
          <Text style={styles.contactText}>ejemplo@email.com</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.contactItem}
          onPress={() => Linking.openURL('tel:+1234567890')}
        >
          <Ionicons name="call" size={24} color="#FFA500" />
          <Text style={styles.contactText}>+1 234 567 890</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.contactItem}
          onPress={() => Linking.openURL('https://instagram.com')}
        >
          <Ionicons name="logo-instagram" size={24} color="#FFA500" />
          <Text style={styles.contactText}>@tuusuario</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contactCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    color: '#FFA500',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  contactText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
}); 
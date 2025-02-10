import { Stack } from 'expo-router';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <Tabs screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: '#000000',
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#FFA500',
        tabBarInactiveTintColor: '#666',
      }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Reproductor',
            tabBarIcon: ({ color }) => <Ionicons name="musical-notes" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Eventos',
            tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="contact"
          options={{
            title: 'Contacto',
            tabBarIcon: ({ color }) => <Ionicons name="mail" size={24} color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
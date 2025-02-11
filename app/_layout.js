import { Tabs } from 'expo-router';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function AppLayout() {
  return (
    <NavigationContainer independent={true}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#000000' },
          tabBarActiveTintColor: '#FFA500'
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="musical-notes" size={24} color={color} />
            ),
            title: 'Reproductor'
          }}
        />
      </Tabs>
    </NavigationContainer>
  );
}
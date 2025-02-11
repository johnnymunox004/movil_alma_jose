import MusicPlayer from '../components/MusicPlayer';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Page() {
  const navigation = useNavigation();
  
  return (
    <View style={{ flex: 1 }}>
      <MusicPlayer navigation={navigation} />
    </View>
  );
}
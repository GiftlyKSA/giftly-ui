import { Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useTopInset = () => {
  const { top } = useSafeAreaInsets();
  return Platform.OS === 'ios' ? top : (StatusBar.currentHeight ?? 0);
};

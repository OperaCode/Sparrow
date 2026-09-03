import { ActivityIndicator, View, type ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';

interface LoadingProps {
  style?: ViewStyle;
  color?: string;
  size?: 'small' | 'large';
}

export function Loading({ style, color = colors.primary, size = 'large' }: LoadingProps) {
  return (
    <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

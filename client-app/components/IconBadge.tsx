import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';

interface IconBadgeProps {
  children: React.ReactNode;
  size?: number;
  background?: string;
  style?: ViewStyle;
}

export function IconBadge({ children, size = 72, background = colors.primarySoft, style }: IconBadgeProps) {
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: background }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
});

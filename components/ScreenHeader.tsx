import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';

interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack ?? (() => router.back())} hitSlop={8}>
        <ArrowLeft color={colors.text} size={24} strokeWidth={2} />
      </TouchableOpacity>
      {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : <View />}
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  title: { ...typography.h3, color: colors.text, flex: 1, textAlign: 'center' },
  spacer: { width: 24 },
});

import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { colors, radius, typography, shadows, spacing } from '@/constants/theme';

type BadgeVariant = 'success' | 'info' | 'warning' | 'error' | 'neutral' | 'primary';

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.successLight, text: colors.success },
  info: { bg: colors.infoLight, text: colors.info },
  warning: { bg: colors.warningLight, text: colors.warning },
  error: { bg: colors.errorLight, text: colors.error },
  neutral: { bg: colors.surfaceAlt, text: colors.textSecondary },
  primary: { bg: colors.primarySoft, text: colors.primaryDark },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ label, variant = 'neutral', style, textStyle }: BadgeProps) {
  const v = variantColors[variant];
  return (
    <View style={[styles.container, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.small,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
});

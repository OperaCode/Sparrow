import type { ReactNode } from 'react';
import { Text, View, StyleSheet, type ViewStyle } from 'react-native';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { IconBadge } from '@/components/IconBadge';
import { PackageSearch } from 'lucide-react-native';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  style?: ViewStyle;
}

export function EmptyState({ icon, title, message, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <IconBadge size={64} style={styles.icon}>
        {icon ?? <PackageSearch color={colors.primaryDark} size={28} strokeWidth={1.75} />}
      </IconBadge>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

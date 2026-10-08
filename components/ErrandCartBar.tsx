import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';
import { colors, radius, spacing, typography, shadows } from '@/constants/theme';

interface ErrandCartBarProps {
  itemCount: number;
  subtotal: number;
  onPress: () => void;
}

export function ErrandCartBar({ itemCount, subtotal, onPress }: ErrandCartBarProps) {
  if (itemCount === 0) return null;

  return (
    <TouchableOpacity style={styles.bar} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.left}>
        <View style={styles.badge}>
          <ShoppingBag color={colors.ink} size={16} strokeWidth={2} />
          <Text style={styles.badgeCount}>{itemCount}</Text>
        </View>
        <Text style={styles.label}>View cart · ₦{subtotal.toLocaleString()}</Text>
      </View>
      <ChevronRight color={colors.ink} size={20} strokeWidth={2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.lg,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeCount: { ...typography.captionMedium, color: colors.ink, fontFamily: 'PlusJakartaSans-Bold' },
  label: { ...typography.bodyMedium, color: colors.ink, fontFamily: 'PlusJakartaSans-Bold' },
});

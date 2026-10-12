import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}

export function QuantityStepper({ quantity, onIncrement, onDecrement, disabled }: QuantityStepperProps) {
  if (quantity === 0) {
    return (
      <TouchableOpacity
        style={[styles.addBtn, disabled && styles.disabled]}
        activeOpacity={0.85}
        onPress={onIncrement}
        disabled={disabled}
      >
        <Text style={styles.addBtnText}>Add</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.stepper}>
      <TouchableOpacity style={styles.stepBtn} activeOpacity={0.85} onPress={onDecrement} hitSlop={8}>
        <Minus color={colors.primaryDark} size={16} strokeWidth={2.5} />
      </TouchableOpacity>
      <Text style={styles.quantity}>{quantity}</Text>
      <TouchableOpacity style={styles.stepBtn} activeOpacity={0.85} onPress={onIncrement} hitSlop={8}>
        <Plus color={colors.primaryDark} size={16} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
  },
  disabled: { opacity: 0.4 },
  addBtnText: { ...typography.captionMedium, color: colors.primaryDark, fontFamily: 'PlusJakartaSans-Bold' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  stepBtn: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  quantity: { ...typography.bodyMedium, color: colors.primaryDark, fontFamily: 'PlusJakartaSans-Bold', minWidth: 16, textAlign: 'center' },
});

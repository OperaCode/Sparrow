import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius } from '@/constants/theme';
import type { Community } from '@/types';
import type { ZoneSelection } from '@/lib/pricing';

const COMMUNITY_OPTIONS: { value: Community; label: string }[] = [
  { value: 'igbesa', label: 'Igbesa' },
  { value: 'lusada', label: 'Lusada' },
  { value: 'ketu', label: 'Ketu' },
];

interface ZonePickerProps {
  label: string;
  value: ZoneSelection;
  onChange: (value: ZoneSelection) => void;
  error?: string;
  unsureLabel?: string;
}

export function ZonePicker({ label, value, onChange, error, unsureLabel = 'Not sure / outside these areas' }: ZonePickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {COMMUNITY_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.85}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(option.value)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.unsureChip, value === 'unsure' && styles.chipSelected]}
        onPress={() => onChange('unsure')}
      >
        <Text style={[styles.chipText, value === 'unsure' && styles.chipTextSelected]}>{unsureLabel}</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  unsureChip: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { ...typography.captionMedium, color: colors.text },
  chipTextSelected: { color: colors.primaryDark, fontFamily: 'PlusJakartaSans-Bold' },
  errorText: { ...typography.small, color: colors.error, marginTop: spacing.xs },
});

import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

const TOTAL_STEPS = 5;

export function ProgressDots({ step }: { step: number }) {
  const steps = Array.from({ length: TOTAL_STEPS }, (_, i) => i);
  return (
    <View style={styles.dots}>
      {steps.map((s, i) => (
        <View key={i} style={styles.dotRow}>
          <View style={[styles.dot, i <= step && styles.dotActive]} />
          {i < steps.length - 1 && <View style={[styles.line, i < step && styles.lineDone]} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', alignItems: 'center' },
  dotRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
  line: { width: 14, height: 2, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.primary },
});

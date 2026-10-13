import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { SparrowLogo } from '@/components/SparrowLogo';
import { ProgressDots } from '@/components/ProgressDots';

export function StepHeader({ step }: { step: number }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
        <ArrowLeft color={colors.text} size={24} strokeWidth={2} />
      </TouchableOpacity>
      <SparrowLogo size={22} color={colors.primary} />
      <ProgressDots step={step} />
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
  },
});

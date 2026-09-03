import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { Button } from '@/components/Button';
import ConfettiCannon from 'react-native-confetti-cannon';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ErrandConfirmationScreen() {
  const { total } = useLocalSearchParams<{ total: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.circle}>
          <Check color={colors.white} size={40} strokeWidth={3} />
        </View>
        <Text style={styles.title}>Errand requested</Text>
        <Text style={styles.subtitle}>
          We're finding a Sparrow near you{total ? ` — have ₦${total} ready to hand over` : ''}. You'll get a
          notification once someone accepts.
        </Text>
      </View>

      <ConfettiCannon count={80} origin={{ x: SCREEN_WIDTH / 2, y: 0 }} fadeOut fallSpeed={2600} explosionSpeed={350} />

      <View style={styles.footer}>
        <Button label="Back to Home" onPress={() => router.replace('/(tabs)')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  title: { ...typography.h1, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 24 },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
});

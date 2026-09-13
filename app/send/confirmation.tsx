import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import ConfettiCannon from 'react-native-confetti-cannon';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ConfirmationScreen() {
  const { deliveryId, deliveryCode, pendingQuote } = useLocalSearchParams<{
    deliveryId: string;
    deliveryCode: string;
    pendingQuote?: string;
  }>();
  const isPendingQuote = pendingQuote === '1';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.circle}>
          <Check color={colors.white} size={40} strokeWidth={3} />
        </View>
        <Text style={styles.title}>{isPendingQuote ? 'Quote requested' : 'Payment received'}</Text>
        <Text style={styles.subtitle}>
          {deliveryCode ? `Your delivery ${deliveryCode} ` : 'Your delivery '}
          {isPendingQuote
            ? "is outside our standard zones. Operations will contact you with a price shortly — no payment is needed yet."
            : 'is being confirmed. We\'re confirming your payment and getting your Sparrow ready.'}
        </Text>
      </View>

      <ConfettiCannon count={120} origin={{ x: SCREEN_WIDTH / 2, y: 0 }} fadeOut autoStart={true} fallSpeed={1800} explosionSpeed={350} />

      <View style={styles.footer}>
        <Button label="Back to Home" onPress={() => router.replace('/(tabs)')} />
        <Button
          label="Track Delivery"
          variant="ghost"
          onPress={() => router.replace(deliveryId ? `/delivery/${deliveryId}` : '/(tabs)/deliveries')}
          style={styles.trackBtn}
        />
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
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  trackBtn: { marginTop: spacing.sm },
});

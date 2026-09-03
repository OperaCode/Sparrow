import { View, Text, StyleSheet } from 'react-native';
import { router, Redirect } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';

export default function ConfirmationScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.bird}>🐦</Text>
        <Text style={styles.title}>Payment received</Text>
        <Text style={styles.subtitle}>
          We're confirming your payment and getting your Sparrow ready.
        </Text>

        <View style={styles.illustration}>
          <View style={styles.circle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Back to Home" onPress={() => router.replace('/(tabs)')} />
        <Button label="Track Delivery" variant="ghost" onPress={() => router.replace('/(tabs)/deliveries')} style={styles.trackBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  bird: { fontSize: 64, marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 24 },
  illustration: { marginTop: spacing.xxl },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontSize: 40, color: colors.white, fontFamily: 'PlusJakartaSans-Bold' },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  trackBtn: { marginTop: spacing.sm },
});

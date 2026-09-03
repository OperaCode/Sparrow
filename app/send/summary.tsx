import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useDraft } from '@/contexts/DraftContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Check } from 'lucide-react-native';
import { getMockPrice } from '@/lib/mockData';
import type { Community } from '@/types';

export default function SummaryScreen() {
  const { draft, updateDraft } = useDraft();
  const { profile } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickupZone = (profile?.community as Community) || 'igbesa';
  let destZone: Community = draft.destinationZone as Community;
  if (!destZone) {
    const destAddr = draft.destinationAddress.toLowerCase();
    if (destAddr.includes('lusada')) destZone = 'lusada';
    else if (destAddr.includes('ketu')) destZone = 'ketu';
    else destZone = pickupZone;
  }
  const price = getMockPrice(pickupZone, destZone);

  const handleContinue = () => {
    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions to continue');
      return;
    }
    setError(null);
    updateDraft({ price, pickupZone, destinationZone: destZone });
    router.push('/send/payment');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft color={colors.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Text style={styles.bird}>🐦</Text>
      <Text style={styles.title}>You're all set!</Text>

      <View style={styles.routeCard}>
        <View style={styles.routePoint}>
          <View style={styles.routeDot} />
          <View>
            <Text style={styles.routeLabel}>PICKUP</Text>
            <Text style={styles.routeAddress} numberOfLines={2}>{draft.pickupAddress || 'Lusada Market'}</Text>
            {draft.pickupLandmark ? <Text style={styles.routeLandmark}>{draft.pickupLandmark}</Text> : null}
          </View>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, styles.routeDotDest]} />
          <View>
            <Text style={styles.routeLabel}>DESTINATION</Text>
            <Text style={styles.routeAddress} numberOfLines={2}>{draft.destinationAddress || 'Igbesa Junction'}</Text>
            {draft.destinationLandmark ? <Text style={styles.routeLandmark}>{draft.destinationLandmark}</Text> : null}
          </View>
        </View>
      </View>

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>Delivery fee</Text>
        <Text style={styles.priceValue}>₦{price.toLocaleString()}</Text>
      </View>

      <TouchableOpacity
        style={styles.termsRow}
        activeOpacity={0.85}
        onPress={() => {
          setTermsAccepted(!termsAccepted);
          setError(null);
        }}
      >
        <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
          {termsAccepted && <Check color={colors.white} size={16} strokeWidth={3} />}
        </View>
        <Text style={styles.termsText}>
          I agree to Sparrow's Terms & Conditions
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button label="Continue to Payment" onPress={handleContinue} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
  bird: { fontSize: 48, textAlign: 'center', marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.text, textAlign: 'center', marginBottom: spacing.xl },
  routeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  routePoint: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  routeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginTop: 4 },
  routeDotDest: { backgroundColor: colors.info },
  routeLine: { width: 2, height: 24, backgroundColor: colors.border, marginLeft: 5, marginVertical: 4 },
  routeLabel: { ...typography.small, color: colors.textTertiary, fontFamily: 'PlusJakartaSans-Bold' },
  routeAddress: { ...typography.body, color: colors.text, marginTop: 2 },
  routeLandmark: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  priceCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  priceLabel: { ...typography.bodyMedium, color: colors.white, opacity: 0.9 },
  priceValue: { ...typography.display, color: colors.white, fontSize: 36, marginTop: spacing.xs },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsText: { ...typography.body, color: colors.text, flex: 1 },
  errorText: { ...typography.small, color: colors.error, marginBottom: spacing.md },
});

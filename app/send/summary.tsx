import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, radius, gradients } from '@/constants/theme';
import { Button } from '@/components/Button';
import { IconBadge } from '@/components/IconBadge';
import { SparrowIllustration } from '@/components/SparrowIllustration';
import { StepHeader } from '@/components/StepHeader';
import { useDraft } from '@/contexts/DraftContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDeliveries } from '@/contexts/DeliveriesContext';
import { Check } from 'lucide-react-native';
import { getSpecialPickupFee, getZonePrice } from '@/lib/pricing';
import type { SpecialPickupTier } from '@/types';

export default function SummaryScreen() {
  const { draft, updateDraft, resetDraft } = useDraft();
  const { session } = useAuth();
  const { addDelivery } = useDeliveries();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestingQuote, setRequestingQuote] = useState(false);

  const zoneResult = getZonePrice(draft.pickupZone, draft.destinationZone);
  const specialPickupResult =
    draft.serviceType === 'special_pickup'
      ? getSpecialPickupFee(draft.pickupZone, draft.specialPickupZone)
      : null;

  const isManualQuote = zoneResult.price === null || (specialPickupResult ? specialPickupResult.fee === null : false);
  const totalPrice = isManualQuote ? null : (zoneResult.price ?? 0) + (specialPickupResult?.fee ?? 0);

  const handleRequestQuote = () => {
    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions to continue');
      return;
    }
    setError(null);
    setRequestingQuote(true);
    updateDraft({
      zoneTier: zoneResult.tier,
      pricingStatus: 'pending_manual_quote',
      specialPickupTier: specialPickupResult && specialPickupResult.tier !== 'outside_area' ? specialPickupResult.tier : null,
      specialPickupFee: null,
      price: null,
    });
    const delivery = addDelivery(
      {
        ...draft,
        zoneTier: zoneResult.tier,
        pricingStatus: 'pending_manual_quote',
        specialPickupTier: specialPickupResult && specialPickupResult.tier !== 'outside_area' ? specialPickupResult.tier : null,
        specialPickupFee: null,
        price: null,
      },
      session?.user.id ?? 'mock-user-id',
    );
    resetDraft();
    setRequestingQuote(false);
    router.replace({
      pathname: '/send/confirmation',
      params: { deliveryId: delivery.id, deliveryCode: delivery.delivery_code, pendingQuote: '1' },
    });
  };

  const handleContinue = () => {
    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions to continue');
      return;
    }
    setError(null);
    updateDraft({
      price: totalPrice,
      zoneTier: zoneResult.tier,
      pricingStatus: 'auto',
      // Reaching this branch (isManualQuote === false) guarantees the tier is local/nearby, never outside_area.
      specialPickupTier: (specialPickupResult?.tier as SpecialPickupTier | undefined) ?? null,
      specialPickupFee: specialPickupResult?.fee ?? null,
    });
    router.push('/send/payment');
  };

  return (
    <View style={styles.container}>
      <StepHeader step={3} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <IconBadge style={styles.iconBadge} background={colors.primarySoft}>
          <SparrowIllustration size={44} animated />
        </IconBadge>
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

        {isManualQuote ? (
          <View style={styles.quoteCard}>
            <Text style={styles.quoteTitle}>We need to review this route</Text>
            <Text style={styles.quoteBody}>
              This movement falls outside our standard zones, so Operations will confirm a price with you directly
              before payment.
            </Text>
          </View>
        ) : (
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.priceCard}>
            <Text style={styles.priceLabel}>Delivery fee</Text>
            <Text style={styles.priceValue}>₦{totalPrice!.toLocaleString()}</Text>
            {specialPickupResult && specialPickupResult.fee != null && (
              <Text style={styles.priceBreakdown}>
                Includes ₦{specialPickupResult.fee.toLocaleString()} Special Pickup fee
              </Text>
            )}
          </LinearGradient>
        )}

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

        {isManualQuote ? (
          <Button label="Request a Quote" onPress={handleRequestQuote} loading={requestingQuote} />
        ) : (
          <Button label="Continue to Payment" onPress={handleContinue} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  iconBadge: { marginBottom: spacing.sm },
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
  routeDotDest: { backgroundColor: colors.coral },
  routeLine: { width: 2, height: 24, backgroundColor: colors.border, marginLeft: 5, marginVertical: 4 },
  routeLabel: { ...typography.small, color: colors.textTertiary, fontFamily: 'PlusJakartaSans-Bold' },
  routeAddress: { ...typography.body, color: colors.text, marginTop: 2 },
  routeLandmark: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  priceCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  priceLabel: { ...typography.bodyMedium, color: colors.white, opacity: 0.9 },
  priceValue: { ...typography.display, color: colors.white, fontSize: 36, marginTop: spacing.xs },
  priceBreakdown: { ...typography.small, color: colors.white, opacity: 0.85, marginTop: spacing.xs },
  quoteCard: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  quoteTitle: { ...typography.bodyMedium, color: colors.warning, fontFamily: 'PlusJakartaSans-Bold', marginBottom: spacing.xs },
  quoteBody: { ...typography.caption, color: colors.text, lineHeight: 20 },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsText: { ...typography.body, color: colors.text, flex: 1 },
  errorText: { ...typography.small, color: colors.error, marginBottom: spacing.md },
});

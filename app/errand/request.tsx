import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { IconBadge } from '@/components/IconBadge';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useDeliveries } from '@/contexts/DeliveriesContext';
import { ERRAND_CART_SERVICE_FEE, ERRAND_CART_DELIVERY_FEE } from '@/lib/pricing';
import type { DeliveryDraft } from '@/contexts/DraftContext';

export default function OtherErrandScreen() {
  const { profile } = useAuth();
  const { addDelivery } = useDeliveries();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) newErrors.description = 'Tell your Sparrow what you need';
    if (!location.trim()) newErrors.location = 'Location is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    const cost = parseFloat(estimatedCost) || 0;
    const total = cost + ERRAND_CART_SERVICE_FEE + ERRAND_CART_DELIVERY_FEE;

    const draft: DeliveryDraft = {
      pickupAddress: location,
      pickupLandmark: '',
      pickupContactName: profile?.name || '',
      pickupContactPhone: profile?.phone || '',
      pickupLatitude: null,
      pickupLongitude: null,
      destinationAddress: profile?.name ? `${profile.name}'s address` : 'Customer address',
      destinationLandmark: '',
      destinationContactName: profile?.name || '',
      destinationContactPhone: profile?.phone || '',
      destinationLatitude: null,
      destinationLongitude: null,
      packageCategory: 'other',
      packageDescription: description,
      packageSize: 'small',
      packagePhotoUrl: null,
      pickupZone: profile?.community ?? null,
      destinationZone: profile?.community ?? null,
      price: total,
      serviceType: 'errand',
      zoneTier: null,
      pricingStatus: 'auto',
      itemLocation: 'elsewhere',
      specialPickupZone: null,
      specialPickupTier: null,
      specialPickupFee: null,
      errandCategory: 'other',
      errandTier: 'simple',
      errandFee: ERRAND_CART_SERVICE_FEE,
      estimatedItemCost: cost,
    };

    const delivery = addDelivery(draft, profile?.id ?? 'mock-user-id');
    setSubmitting(false);

    router.push({
      pathname: '/errand/confirmation',
      params: {
        deliveryId: delivery.id,
        deliveryCode: delivery.delivery_code,
        total: total.toLocaleString(),
      },
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Other Errand" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <IconBadge style={styles.iconBadge} background={colors.purpleLight}>
          <Text style={styles.iconEmoji}>📦</Text>
        </IconBadge>
        <Text style={styles.subtitle}>
          Not in our catalogue yet? Tell us what you need and we'll get in touch to confirm the details.
        </Text>

        <View style={styles.form}>
          <Input
            label="What do you need Sparrow to do?"
            placeholder="e.g. Pick up my dry cleaning from Sparkle Cleaners"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.textArea}
            error={errors.description}
          />
          <Input
            label="Where should Sparrow go?"
            placeholder="e.g. Sparkle Cleaners, Church Road"
            value={location}
            onChangeText={setLocation}
            error={errors.location}
          />
          <Input
            label="Estimated item cost (if applicable)"
            placeholder="e.g. 4500"
            value={estimatedCost}
            onChangeText={setEstimatedCost}
            keyboardType="numeric"
          />
        </View>

        <Button label="Submit Request" onPress={handleSubmit} loading={submitting} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  iconBadge: { alignSelf: 'flex-start', marginBottom: spacing.md },
  iconEmoji: { fontSize: 28 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 22 },
  form: { gap: spacing.md, marginBottom: spacing.xl },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});

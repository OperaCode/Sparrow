import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SparrowLogo } from '@/components/SparrowLogo';
import { ArrowLeft } from 'lucide-react-native';
import type { ErrandCategory, ErrandTier } from '@/types';
import type { DeliveryDraft } from '@/contexts/DraftContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDeliveries } from '@/contexts/DeliveriesContext';
import { getErrandFee } from '@/lib/pricing';

const CATEGORIES: { value: ErrandCategory; label: string; emoji: string; color: string; light: string }[] = [
  { value: 'groceries', label: 'Groceries', emoji: '🛒', color: colors.coral, light: colors.coralLight },
  { value: 'pharmacy', label: 'Pharmacy', emoji: '💊', color: colors.teal, light: colors.tealLight },
  { value: 'food_pickup', label: 'Food pickup', emoji: '🍔', color: colors.sky, light: colors.skyLight },
  { value: 'bill_payment', label: 'Bill payment', emoji: '🧾', color: colors.purple, light: colors.purpleLight },
  { value: 'other', label: 'Other', emoji: '❓', color: colors.primaryDark, light: colors.primarySoft },
];

const TIERS: { value: ErrandTier; label: string; description: string }[] = [
  { value: 'simple', label: 'Simple', description: 'A straightforward purchase or task' },
  { value: 'moderate', label: 'Moderate', description: 'Needs more coordination or handling' },
  { value: 'complex', label: 'Complex', description: 'More involved — we\'ll confirm a price with you' },
];

export default function ErrandRequestScreen() {
  const { profile } = useAuth();
  const { addDelivery } = useDeliveries();
  const [category, setCategory] = useState<ErrandCategory | null>(null);
  const [tier, setTier] = useState<ErrandTier | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const cost = parseFloat(estimatedCost) || 0;
  const errandFee = getErrandFee(tier);
  const isManualQuote = tier === 'complex';
  const total = errandFee != null ? cost + errandFee : null;

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};
    if (!category) newErrors.category = 'Please select an errand type';
    if (!tier) newErrors.tier = 'Please select how involved this is';
    if (!description.trim()) newErrors.description = 'Tell your Sparrow what to get';
    if (!location.trim()) newErrors.location = 'Address is required';
    if (!cost) newErrors.estimatedCost = 'Enter what the items should cost';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);

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
      price: isManualQuote ? null : (errandFee ?? 0),
      serviceType: 'errand',
      zoneTier: null,
      pricingStatus: isManualQuote ? 'pending_manual_quote' : 'auto',
      itemLocation: 'with_me',
      specialPickupZone: null,
      specialPickupTier: null,
      specialPickupFee: null,
      errandCategory: category,
      errandTier: tier,
      errandFee: isManualQuote ? null : errandFee,
      estimatedItemCost: cost,
    };

    const delivery = addDelivery(draft, profile?.id ?? 'mock-user-id');
    setSubmitting(false);

    router.push({
      pathname: '/errand/confirmation',
      params: {
        deliveryId: delivery.id,
        deliveryCode: delivery.delivery_code,
        total: total != null ? total.toLocaleString() : '',
        pendingQuote: isManualQuote ? '1' : '',
      },
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft color={colors.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <SparrowLogo size={20} color={colors.primary} />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.iconBadge}>
          <Text style={styles.iconEmoji}>🛍️</Text>
        </View>
        <Text style={styles.title}>What do you need?</Text>
        <Text style={styles.subtitle}>Tell your Sparrow what to get and where — they'll handle the rest.</Text>

        <Text style={styles.sectionLabel}>Errand type</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const selected = category === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                activeOpacity={0.85}
                style={[styles.categoryCard, selected && { borderColor: cat.color, backgroundColor: cat.light }]}
                onPress={() => {
                  setCategory(cat.value);
                  setErrors((prev) => ({ ...prev, category: '' }));
                }}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryLabel, selected && { color: cat.color, fontFamily: 'PlusJakartaSans-Bold' }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

        <Text style={styles.sectionLabel}>How involved is this?</Text>
        <View style={styles.tierList}>
          {TIERS.map((t) => {
            const selected = tier === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                activeOpacity={0.85}
                style={[styles.tierCard, selected && styles.tierCardSelected]}
                onPress={() => {
                  setTier(t.value);
                  setErrors((prev) => ({ ...prev, tier: '' }));
                }}
              >
                <View style={styles.tierHeader}>
                  <Text style={[styles.tierLabel, selected && styles.tierLabelSelected]}>{t.label}</Text>
                  <Text style={[styles.tierFee, selected && styles.tierLabelSelected]}>
                    {t.value === 'complex' ? 'Manual quote' : `₦${getErrandFee(t.value)?.toLocaleString()}`}
                  </Text>
                </View>
                <Text style={styles.tierDescription}>{t.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.tier ? <Text style={styles.errorText}>{errors.tier}</Text> : null}

        <View style={styles.form}>
          <Input
            label="What should we get?"
            placeholder="e.g. 2 loaves of bread, a dozen eggs, and my prescription from MedPlus"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.textArea}
            error={errors.description}
          />
          <Input
            label="Where should your Sparrow go?"
            placeholder="e.g. MedPlus Pharmacy, Church Road"
            value={location}
            onChangeText={setLocation}
            error={errors.location}
          />
          <Input
            label="Estimated item cost"
            placeholder="e.g. 4500"
            value={estimatedCost}
            onChangeText={setEstimatedCost}
            keyboardType="numeric"
            error={errors.estimatedCost}
          />
        </View>

        <View style={styles.feeCard}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Estimated item cost</Text>
            <Text style={styles.feeValue}>₦{cost.toLocaleString()}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Sparrow service fee</Text>
            <Text style={styles.feeValue}>{isManualQuote ? 'Manual quote' : `₦${(errandFee ?? 0).toLocaleString()}`}</Text>
          </View>
          <View style={styles.feeDivider} />
          <View style={styles.feeRow}>
            <Text style={styles.feeTotalLabel}>You'll hand over</Text>
            <Text style={styles.feeTotalValue}>{total != null ? `₦${total.toLocaleString()}` : 'To be confirmed'}</Text>
          </View>
        </View>

        <Button
          label={isManualQuote ? 'Request a Quote' : 'Find a Sparrow'}
          onPress={handleContinue}
          loading={submitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerSpacer: { width: 24 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconEmoji: { fontSize: 28 },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 22 },
  sectionLabel: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xs },
  categoryCard: {
    width: '30%',
    flexGrow: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryEmoji: { fontSize: 20 },
  categoryLabel: { ...typography.small, color: colors.text, textAlign: 'center' },
  tierList: { gap: spacing.sm, marginBottom: spacing.xs },
  tierCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  tierCardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierLabel: { ...typography.bodyMedium, color: colors.text },
  tierLabelSelected: { color: colors.primaryDark, fontFamily: 'PlusJakartaSans-Bold' },
  tierFee: { ...typography.captionMedium, color: colors.textSecondary },
  tierDescription: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  form: { gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.lg },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  feeCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.xl,
  },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  feeLabel: { ...typography.captionMedium, color: colors.primaryDark },
  feeValue: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold' },
  feeDivider: { height: 1, backgroundColor: 'rgba(217,119,6,0.2)', marginVertical: spacing.xs },
  feeTotalLabel: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold' },
  feeTotalValue: { ...typography.h3, color: colors.text },
  errorText: { ...typography.small, color: colors.error, marginBottom: spacing.md },
});

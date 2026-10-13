import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { IconBadge } from '@/components/IconBadge';
import { StepHeader } from '@/components/StepHeader';
import { ZonePicker } from '@/components/ZonePicker';
import { useDraft } from '@/contexts/DraftContext';
import { useAddressBook } from '@/contexts/AddressBookContext';
import { Bookmark } from 'lucide-react-native';
import { getZonePrice } from '@/lib/pricing';

export default function DestinationScreen() {
  const { draft, updateDraft } = useDraft();
  const { savedAddresses } = useAddressBook();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};
    if (!draft.destinationAddress.trim()) newErrors.destinationAddress = 'Address is required';
    if (!draft.destinationContactName.trim()) newErrors.destinationContactName = 'Recipient name is required';
    if (!draft.destinationContactPhone.trim()) newErrors.destinationContactPhone = 'Recipient phone is required';
    if (!draft.destinationZone) newErrors.destinationZone = 'Please select the destination zone';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    router.push('/send/summary');
  };

  const applySavedAddress = (a: (typeof savedAddresses)[number]) => {
    updateDraft({
      destinationAddress: a.address,
      destinationLandmark: a.landmark || '',
      destinationContactName: a.contact_name,
      destinationContactPhone: a.contact_phone,
      destinationZone: a.zone,
    });
    setErrors({});
  };

  const zonePreview =
    draft.pickupZone && draft.destinationZone ? getZonePrice(draft.pickupZone, draft.destinationZone) : null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StepHeader step={2} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <IconBadge style={styles.iconBadge} background={colors.coralLight}>
          <Text style={styles.iconEmoji}>🚩</Text>
        </IconBadge>
        <Text style={styles.title}>Where should we take it?</Text>

        {savedAddresses.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Send to a saved address</Text>
            <View style={styles.chipRow}>
              {savedAddresses.map((a) => {
                const selected =
                  draft.destinationAddress === a.address && draft.destinationContactPhone === a.contact_phone;
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.chip, selected && styles.chipSelected]}
                    activeOpacity={0.85}
                    onPress={() => applySavedAddress(a)}
                  >
                    <Bookmark color={selected ? colors.white : colors.primaryDark} size={14} strokeWidth={2} />
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{a.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
        <ZonePicker
          label="Destination zone"
          value={draft.destinationZone}
          onChange={(v) => updateDraft({ destinationZone: v })}
          error={errors.destinationZone}
        />
        <View style={styles.form}>
          <Input
            label="Destination address"
            placeholder="e.g. Igbesa Junction"
            value={draft.destinationAddress}
            onChangeText={(v) => updateDraft({ destinationAddress: v })}
            error={errors.destinationAddress}
          />
          <Input
            label="Landmark (optional)"
            placeholder="e.g. Near the filling station"
            value={draft.destinationLandmark}
            onChangeText={(v) => updateDraft({ destinationLandmark: v })}
          />
          <Text style={styles.sectionLabel}>Who should get it?</Text>
          <Input
            label="Recipient name"
            placeholder="e.g. Jack Sparrow"
            value={draft.destinationContactName}
            onChangeText={(v) => updateDraft({ destinationContactName: v })}
            error={errors.destinationContactName}
          />
          <Input
            label="Recipient phone"
            placeholder="e.g. 801 234 5678"
            value={draft.destinationContactPhone}
            onChangeText={(v) => updateDraft({ destinationContactPhone: v })}
            keyboardType="phone-pad"
            error={errors.destinationContactPhone}
          />
        </View>

        {zonePreview && (
          <View style={styles.pricePreview}>
            {zonePreview.price !== null ? (
              <Text style={styles.pricePreviewText}>
                Zone {zonePreview.tier} · ₦{zonePreview.price.toLocaleString()} delivery fee
              </Text>
            ) : (
              <Text style={styles.pricePreviewText}>
                This route is outside our standard zones — Operations will confirm a price with you.
              </Text>
            )}
          </View>
        )}

        <Button label="Continue" onPress={handleContinue} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, flexGrow: 1 },
  iconBadge: { alignSelf: 'flex-start', marginBottom: spacing.md },
  iconEmoji: { fontSize: 26 },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.sm },
  form: { gap: spacing.md, marginBottom: spacing.xl },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
  },
  chipSelected: { backgroundColor: colors.primary },
  chipText: { ...typography.captionMedium, color: colors.primaryDark },
  chipTextSelected: { color: colors.white, fontFamily: 'PlusJakartaSans-Bold' },
  pricePreview: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  pricePreviewText: { ...typography.captionMedium, color: colors.primaryDark, textAlign: 'center' },
});

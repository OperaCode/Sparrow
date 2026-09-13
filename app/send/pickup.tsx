import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, radius, gradients } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { IconBadge } from '@/components/IconBadge';
import { StepHeader } from '@/components/StepHeader';
import { ZonePicker } from '@/components/ZonePicker';
import { useDraft } from '@/contexts/DraftContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAddressBook } from '@/contexts/AddressBookContext';
import { Lock, Check } from 'lucide-react-native';
import type { Community } from '@/types';

export default function PickupScreen() {
  const { draft, updateDraft } = useDraft();
  const { profile } = useAuth();
  const { savedAddresses, addSavedAddress } = useAddressBook();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveAsHome, setSaveAsHome] = useState(true);

  const homeAddress = savedAddresses.find((a) => a.label.toLowerCase() === 'home') ?? savedAddresses[0] ?? null;
  const isLocked = draft.itemLocation !== 'elsewhere' && !!homeAddress;
  const canOfferSaveAsHome = !isLocked && draft.itemLocation === 'with_me';
  const communityLabel = profile?.community
    ? profile.community.charAt(0).toUpperCase() + profile.community.slice(1)
    : null;

  useEffect(() => {
    const withMe = draft.itemLocation !== 'elsewhere';
    updateDraft({
      pickupContactName: profile?.name || '',
      pickupContactPhone: profile?.phone || '',
      pickupZone: draft.pickupZone ?? homeAddress?.zone ?? profile?.community ?? null,
      ...(withMe && homeAddress && !draft.pickupAddress
        ? { pickupAddress: homeAddress.address, pickupLandmark: homeAddress.landmark || '' }
        : {}),
    });
    // Prefetch once when entering the flow — the sender is always the logged-in user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (value: 'with_me' | 'elsewhere') => {
    if (value === 'with_me') {
      updateDraft({
        itemLocation: 'with_me',
        specialPickupZone: null,
        pickupAddress: homeAddress?.address ?? draft.pickupAddress,
        pickupLandmark: homeAddress?.landmark ?? draft.pickupLandmark,
        pickupZone: homeAddress?.zone ?? profile?.community ?? draft.pickupZone,
      });
    } else {
      updateDraft({ itemLocation: 'elsewhere', pickupAddress: '', pickupLandmark: '' });
    }
    setErrors({});
  };

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};
    if (!draft.pickupAddress.trim()) newErrors.pickupAddress = 'Address is required';
    if (draft.itemLocation === 'elsewhere' && !draft.specialPickupZone) {
      newErrors.specialPickupZone = 'Please select where the item is';
    }
    if (!draft.pickupZone) {
      newErrors.general = "We couldn't find your community — add a saved home address or update your profile.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (canOfferSaveAsHome && saveAsHome) {
      addSavedAddress({
        label: 'Home',
        address: draft.pickupAddress.trim(),
        landmark: draft.pickupLandmark.trim() || null,
        contact_name: profile?.name || draft.pickupContactName,
        contact_phone: profile?.phone || draft.pickupContactPhone,
        zone: (draft.pickupZone && draft.pickupZone !== 'unsure' ? draft.pickupZone : null) as Community | null,
      });
    }

    updateDraft({
      serviceType: draft.itemLocation === 'elsewhere' ? 'special_pickup' : 'standard',
    });
    router.push('/send/destination');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StepHeader step={1} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <IconBadge style={styles.iconBadge} background={colors.skyLight}>
          <Text style={styles.iconEmoji}>📍</Text>
        </IconBadge>
        <Text style={styles.title}>Where are we picking it up?</Text>

        <View style={styles.senderCard}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.senderAvatar}
          >
            <Text style={styles.senderAvatarText}>{profile?.name?.charAt(0).toUpperCase() || 'J'}</Text>
          </LinearGradient>
          <View style={styles.senderText}>
            <Text style={styles.senderLabel}>Sending as</Text>
            <Text style={styles.senderValue}>{profile?.name || 'Jack Sparrow'}</Text>
            {profile?.phone ? <Text style={styles.senderPhone}>{profile.phone}</Text> : null}
          </View>
          {communityLabel && (
            <View style={styles.communityBadge}>
              <Text style={styles.communityBadgeText}>{communityLabel}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>Is the item with you, or somewhere else?</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.toggleOption, draft.itemLocation === 'with_me' && styles.toggleSelected]}
            onPress={() => handleToggle('with_me')}
          >
            <Text style={[styles.toggleText, draft.itemLocation === 'with_me' && styles.toggleTextSelected]}>
              It's with me
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.toggleOption, draft.itemLocation === 'elsewhere' && styles.toggleSelected]}
            onPress={() => handleToggle('elsewhere')}
          >
            <Text style={[styles.toggleText, draft.itemLocation === 'elsewhere' && styles.toggleTextSelected]}>
              It's somewhere else
            </Text>
          </TouchableOpacity>
        </View>

        {draft.itemLocation === 'elsewhere' && (
          <>
            <Text style={styles.helperText}>
              We'll collect it from a third-party location first — a Special Pickup fee applies.
            </Text>
            <ZonePicker
              label="Where is the item?"
              value={draft.specialPickupZone}
              onChange={(v) => updateDraft({ specialPickupZone: v })}
              error={errors.specialPickupZone}
            />
          </>
        )}

        <View style={styles.form}>
          <Input
            label="Pickup address"
            placeholder="e.g. 12 Adeyemi Street, Lusada"
            value={draft.pickupAddress}
            onChangeText={(v) => updateDraft({ pickupAddress: v })}
            error={errors.pickupAddress}
            editable={!isLocked}
          />
          <Input
            label="Landmark (optional)"
            placeholder="e.g. Opposite First Bank"
            value={draft.pickupLandmark}
            onChangeText={(v) => updateDraft({ pickupLandmark: v })}
            editable={!isLocked}
          />
          {isLocked ? (
            <View style={styles.lockedNote}>
              <Lock color={colors.textTertiary} size={13} strokeWidth={2} />
              <Text style={styles.lockedNoteText}>
                This is your saved address. Choose "It's somewhere else" to pick up from a different location.
              </Text>
            </View>
          ) : (
            canOfferSaveAsHome && (
              <TouchableOpacity
                style={styles.saveHomeRow}
                activeOpacity={0.85}
                onPress={() => setSaveAsHome((prev) => !prev)}
              >
                <View style={[styles.checkbox, saveAsHome && styles.checkboxChecked]}>
                  {saveAsHome && <Check color={colors.white} size={14} strokeWidth={3} />}
                </View>
                <Text style={styles.saveHomeText}>Save this as my Home address for next time</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}

        <Button label="Continue" onPress={handleContinue} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, flexGrow: 1 },
  iconBadge: { alignSelf: 'flex-start', marginBottom: spacing.md },
  iconEmoji: { fontSize: 28 },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  senderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  senderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderAvatarText: { ...typography.bodyMedium, color: colors.white, fontFamily: 'PlusJakartaSans-Bold' },
  senderText: { flex: 1 },
  senderLabel: { ...typography.small, color: colors.primaryDark },
  senderValue: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-SemiBold', marginTop: 2 },
  senderPhone: { ...typography.small, color: colors.textSecondary, marginTop: 1 },
  communityBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  communityBadgeText: { ...typography.small, color: colors.primaryDark, fontFamily: 'PlusJakartaSans-SemiBold' },
  form: { gap: spacing.md, marginBottom: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  toggleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  toggleOption: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  toggleSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  toggleText: { ...typography.captionMedium, color: colors.text },
  toggleTextSelected: { color: colors.primaryDark, fontFamily: 'PlusJakartaSans-Bold' },
  helperText: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm, lineHeight: 18 },
  lockedNote: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginTop: -spacing.xs },
  lockedNoteText: { ...typography.small, color: colors.textTertiary, flex: 1, lineHeight: 17 },
  saveHomeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: -spacing.xs },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  saveHomeText: { ...typography.small, color: colors.textSecondary, flex: 1 },
  errorText: { ...typography.small, color: colors.error, marginBottom: spacing.md },
});

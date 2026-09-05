import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { IconBadge } from '@/components/IconBadge';
import { StepHeader } from '@/components/StepHeader';
import { useDraft } from '@/contexts/DraftContext';
import { useAddressBook } from '@/contexts/AddressBookContext';
import { Bookmark } from 'lucide-react-native';

export default function DestinationScreen() {
  const { draft, updateDraft } = useDraft();
  const { savedAddresses } = useAddressBook();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};
    if (!draft.destinationAddress.trim()) newErrors.destinationAddress = 'Address is required';
    if (!draft.destinationContactName.trim()) newErrors.destinationContactName = 'Recipient name is required';
    if (!draft.destinationContactPhone.trim()) newErrors.destinationContactPhone = 'Recipient phone is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    router.push('/send/package');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StepHeader step={1} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <IconBadge style={styles.iconBadge} background={colors.coralLight}>
          <Text style={styles.iconEmoji}>🚩</Text>
        </IconBadge>
        <Text style={styles.title}>Where should we take it?</Text>

        {savedAddresses.length > 0 && (
          <View style={styles.chipRow}>
            {savedAddresses.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.chip}
                activeOpacity={0.85}
                onPress={() => {
                  updateDraft({
                    destinationAddress: a.address,
                    destinationLandmark: a.landmark || '',
                    destinationContactName: a.contact_name,
                    destinationContactPhone: a.contact_phone,
                    destinationZone: a.zone,
                  });
                  setErrors({});
                }}
              >
                <Bookmark color={colors.primaryDark} size={14} strokeWidth={2} />
                <Text style={styles.chipText}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
  chipText: { ...typography.captionMedium, color: colors.primaryDark },
});

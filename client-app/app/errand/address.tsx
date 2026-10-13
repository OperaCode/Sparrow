import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Bookmark } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useErrandCart } from '@/contexts/ErrandCartContext';
import { useAddressBook } from '@/contexts/AddressBookContext';

export default function ErrandAddressScreen() {
  const {
    destinationAddress,
    destinationLandmark,
    destinationContactName,
    destinationContactPhone,
    updateDestination,
  } = useErrandCart();
  const { savedAddresses } = useAddressBook();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const applySavedAddress = (a: (typeof savedAddresses)[number]) => {
    updateDestination({
      destinationAddress: a.address,
      destinationLandmark: a.landmark || '',
      destinationContactName: a.contact_name,
      destinationContactPhone: a.contact_phone,
    });
    setErrors({});
  };

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};
    if (!destinationAddress.trim()) newErrors.destinationAddress = 'Address is required';
    if (!destinationContactName.trim()) newErrors.destinationContactName = 'Recipient name is required';
    if (!destinationContactPhone.trim()) newErrors.destinationContactPhone = 'Recipient phone is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    router.push('/errand/summary');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Delivery Address" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Where should we deliver this?</Text>

        {savedAddresses.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Use a saved address</Text>
            <View style={styles.chipRow}>
              {savedAddresses.map((a) => {
                const selected =
                  destinationAddress === a.address && destinationContactPhone === a.contact_phone;
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

        <View style={styles.form}>
          <Input
            label="Delivery address"
            placeholder="e.g. Igbesa Junction"
            value={destinationAddress}
            onChangeText={(v) => updateDestination({ destinationAddress: v })}
            error={errors.destinationAddress}
          />
          <Input
            label="Landmark (optional)"
            placeholder="e.g. Near the filling station"
            value={destinationLandmark}
            onChangeText={(v) => updateDestination({ destinationLandmark: v })}
          />
          <Text style={styles.sectionLabel}>Who should receive it?</Text>
          <Input
            label="Recipient name"
            placeholder="e.g. Jack Sparrow"
            value={destinationContactName}
            onChangeText={(v) => updateDestination({ destinationContactName: v })}
            error={errors.destinationContactName}
          />
          <Input
            label="Recipient phone"
            placeholder="e.g. 801 234 5678"
            value={destinationContactPhone}
            onChangeText={(v) => updateDestination({ destinationContactPhone: v })}
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
});

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ArrowLeft } from 'lucide-react-native';
import { useAddressBook } from '@/contexts/AddressBookContext';
import type { Community } from '@/types';

const COMMUNITIES: { value: Community; label: string }[] = [
  { value: 'igbesa', label: 'Igbesa' },
  { value: 'lusada', label: 'Lusada' },
  { value: 'ketu', label: 'Ketu' },
];

export default function AddSavedAddressScreen() {
  const { addSavedAddress } = useAddressBook();
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [zone, setZone] = useState<Community | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!label.trim()) newErrors.label = 'Give this address a name';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!contactName.trim()) newErrors.contactName = 'Contact name is required';
    if (!contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    addSavedAddress({
      label: label.trim(),
      address: address.trim(),
      landmark: landmark.trim() || null,
      contact_name: contactName.trim(),
      contact_phone: contactPhone.trim(),
      zone,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft color={colors.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Address</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Input
            label="Label"
            placeholder="e.g. Home, Office"
            value={label}
            onChangeText={setLabel}
            error={errors.label}
          />
          <Input
            label="Address"
            placeholder="e.g. 12 Adeyemi Street, Lusada"
            value={address}
            onChangeText={setAddress}
            error={errors.address}
          />
          <Input
            label="Landmark (optional)"
            placeholder="e.g. Opposite First Bank"
            value={landmark}
            onChangeText={setLandmark}
          />
          <Input
            label="Contact name"
            placeholder="e.g. Jack Sparrow"
            value={contactName}
            onChangeText={setContactName}
            error={errors.contactName}
          />
          <Input
            label="Contact phone"
            placeholder="e.g. 801 234 5678"
            value={contactPhone}
            onChangeText={setContactPhone}
            keyboardType="phone-pad"
            error={errors.contactPhone}
          />
        </View>

        <Text style={styles.sectionLabel}>Community (optional)</Text>
        <View style={styles.zoneRow}>
          {COMMUNITIES.map((c) => {
            const selected = zone === c.value;
            return (
              <TouchableOpacity
                key={c.value}
                activeOpacity={0.85}
                style={[styles.zoneChip, selected && styles.zoneChipSelected]}
                onPress={() => setZone(c.value)}
              >
                <Text style={[styles.zoneLabel, selected && styles.zoneLabelSelected]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button label="Save Address" onPress={handleSave} style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  title: { ...typography.h3, color: colors.text },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  form: { gap: spacing.md, marginBottom: spacing.lg },
  sectionLabel: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  zoneRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  zoneChip: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  zoneChipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  zoneLabel: { ...typography.bodyMedium, color: colors.text },
  zoneLabelSelected: { color: colors.primaryDark, fontFamily: 'PlusJakartaSans-Bold' },
  saveBtn: { marginTop: spacing.sm },
});

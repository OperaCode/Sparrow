import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useDraft } from '@/contexts/DraftContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

export default function PickupScreen() {
  const { draft, updateDraft } = useDraft();
  const { profile } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};
    if (!draft.pickupAddress.trim()) newErrors.pickupAddress = 'Address is required';
    if (!draft.pickupContactName.trim()) newErrors.pickupContactName = 'Sender name is required';
    if (!draft.pickupContactPhone.trim()) newErrors.pickupContactPhone = 'Sender phone is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    updateDraft({ pickupZone: profile?.community || null });
    router.push('/send/destination');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft color={colors.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <ProgressDots step={0} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.bird}>📍</Text>
        <Text style={styles.title}>Where are we picking it up?</Text>

        <View style={styles.form}>
          <Input
            label="Pickup address"
            placeholder="e.g. 12 Adeyemi Street, Lusada"
            value={draft.pickupAddress}
            onChangeText={(v) => updateDraft({ pickupAddress: v })}
            error={errors.pickupAddress}
          />
          <Input
            label="Landmark (optional)"
            placeholder="e.g. Opposite First Bank"
            value={draft.pickupLandmark}
            onChangeText={(v) => updateDraft({ pickupLandmark: v })}
          />
          <Input
            label="Sender name"
            placeholder="e.g. Raphael"
            value={draft.pickupContactName}
            onChangeText={(v) => updateDraft({ pickupContactName: v })}
            error={errors.pickupContactName}
          />
          <Input
            label="Sender phone"
            placeholder="e.g. 801 234 5678"
            value={draft.pickupContactPhone}
            onChangeText={(v) => updateDraft({ pickupContactPhone: v })}
            keyboardType="phone-pad"
            error={errors.pickupContactPhone}
          />
        </View>

        <Button label="Continue" onPress={handleContinue} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function ProgressDots({ step }: { step: number }) {
  const steps = [0, 1, 2];
  return (
    <View style={styles.dots}>
      {steps.map((s, i) => (
        <View key={i} style={styles.dotRow}>
          <View style={[styles.dot, i < step && styles.dotDone, i === step && styles.dotActive]} />
          {i < steps.length - 1 && <View style={[styles.line, i < step && styles.lineDone]} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, flexGrow: 1 },
  bird: { fontSize: 40, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xl },
  form: { gap: spacing.md, marginBottom: spacing.xl },
  dots: { flexDirection: 'row', alignItems: 'center' },
  dotRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
  dotDone: { backgroundColor: colors.primary },
  line: { width: 24, height: 2, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.primary },
});

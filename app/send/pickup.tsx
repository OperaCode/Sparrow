import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { IconBadge } from '@/components/IconBadge';
import { StepHeader } from '@/components/StepHeader';
import { useDraft } from '@/contexts/DraftContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserRound } from 'lucide-react-native';

export default function PickupScreen() {
  const { draft, updateDraft } = useDraft();
  const { profile } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    updateDraft({
      pickupContactName: profile?.name || '',
      pickupContactPhone: profile?.phone || '',
    });
    // Prefetch once when entering the flow — the sender is always the logged-in user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};
    if (!draft.pickupAddress.trim()) newErrors.pickupAddress = 'Address is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    updateDraft({ pickupZone: profile?.community || null });
    router.push('/send/destination');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StepHeader step={0} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <IconBadge style={styles.iconBadge} background={colors.skyLight}>
          <Text style={styles.iconEmoji}>📍</Text>
        </IconBadge>
        <Text style={styles.title}>Where are we picking it up?</Text>

        <View style={styles.senderCard}>
          <View style={styles.senderAvatar}>
            <UserRound color={colors.primaryDark} size={18} strokeWidth={2} />
          </View>
          <View style={styles.senderText}>
            <Text style={styles.senderLabel}>Sending as</Text>
            <Text style={styles.senderValue}>
              {profile?.name || 'Jack Sparrow'} · {profile?.phone || ''}
            </Text>
          </View>
        </View>

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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderText: { flex: 1 },
  senderLabel: { ...typography.small, color: colors.primaryDark },
  senderValue: { ...typography.bodyMedium, color: colors.text, marginTop: 2 },
  form: { gap: spacing.md, marginBottom: spacing.xl },
});

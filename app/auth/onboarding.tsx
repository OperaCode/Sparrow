import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { mockProfile } from '@/lib/mockData';
import type { Community } from '@/types';

const COMMUNITIES: { value: Community; label: string }[] = [
  { value: 'igbesa', label: 'Igbesa' },
  { value: 'lusada', label: 'Lusada' },
  { value: 'ketu', label: 'Ketu' },
];

export default function OnboardingScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { setProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [community, setCommunity] = useState<Community | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNameContinue = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setError(null);
    setStep(1);
  };

  const handleFinish = () => {
    if (!community) {
      setError('Please select your community');
      return;
    }
    setProfile({
      ...mockProfile,
      name: name.trim(),
      phone: phone || mockProfile.phone,
      community,
    });
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {step === 0 ? (
            <>
              <Text style={styles.bird}>👋</Text>
              <Text style={styles.title}>Nice to meet you!</Text>
              <Text style={styles.subtitle}>What should we call you?</Text>

              <View style={styles.form}>
                <Input
                  label="Your name"
                  placeholder="e.g. Raphael"
                  value={name}
                  onChangeText={setName}
                  autoComplete="name"
                  error={error || undefined}
                  returnKeyType="done"
                  onSubmitEditing={handleNameContinue}
                />
              </View>

              <Button label="Continue" onPress={handleNameContinue} />
            </>
          ) : (
            <>
              <Text style={styles.bird}>📍</Text>
              <Text style={styles.title}>Where are you based?</Text>
              <Text style={styles.subtitle}>Select your community to get started.</Text>

              <View style={styles.communityList}>
                {COMMUNITIES.map((c) => (
                  <CommunityCard
                    key={c.value}
                    label={c.label}
                    selected={community === c.value}
                    onPress={() => {
                      setCommunity(c.value);
                      setError(null);
                    }}
                  />
                ))}
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Button label="Let's Go" onPress={handleFinish} />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function CommunityCard({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.communityCard, selected && styles.communitySelected]}
    >
      <Text style={styles.communityIcon}>📍</Text>
      <Text style={[styles.communityLabel, selected && styles.communityLabelSelected]}>{label}</Text>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xxxl + spacing.xl, justifyContent: 'center' },
  bird: { fontSize: 56, textAlign: 'center', marginBottom: spacing.md },
  title: { ...typography.h1, textAlign: 'center', color: colors.text },
  subtitle: { ...typography.body, textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xxl },
  form: { marginBottom: spacing.lg },
  communityList: { gap: spacing.md, marginBottom: spacing.lg },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md + 2,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  communitySelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  communityIcon: { fontSize: 20, marginRight: spacing.md },
  communityLabel: { ...typography.bodyMedium, flex: 1, color: colors.text },
  communityLabelSelected: { color: colors.primaryDark, fontFamily: 'PlusJakartaSans-Bold' },
  checkmark: { fontSize: 18, color: colors.primary, fontFamily: 'PlusJakartaSans-Bold' },
  errorText: { ...typography.small, color: colors.error, textAlign: 'center', marginBottom: spacing.md },
});

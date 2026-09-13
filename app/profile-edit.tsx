import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Check } from 'lucide-react-native';
import type { Community } from '@/types';

const COMMUNITIES: { value: Community; label: string }[] = [
  { value: 'igbesa', label: 'Igbesa' },
  { value: 'lusada', label: 'Lusada' },
  { value: 'ketu', label: 'Ketu' },
];

export default function EditProfileScreen() {
  const { profile, setProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [community, setCommunity] = useState<Community | null>(profile?.community ?? null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!community) {
      setError('Please select your community');
      return;
    }
    if (!profile) return;

    setProfile({ ...profile, name: name.trim(), community });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft color={colors.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input
          label="Your name"
          placeholder="e.g. Jack Sparrow"
          value={name}
          onChangeText={setName}
          containerStyle={styles.field}
        />

        <Text style={styles.sectionLabel}>Community</Text>
        <View style={styles.communityList}>
          {COMMUNITIES.map((c) => {
            const selected = community === c.value;
            return (
              <TouchableOpacity
                key={c.value}
                activeOpacity={0.85}
                onPress={() => {
                  setCommunity(c.value);
                  setError(null);
                }}
                style={[styles.communityCard, selected && styles.communitySelected]}
              >
                <Text style={[styles.communityLabel, selected && styles.communityLabelSelected]}>{c.label}</Text>
                {selected && <Check color={colors.primary} size={18} strokeWidth={3} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button label="Save Changes" onPress={handleSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  title: { ...typography.h3, color: colors.text },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  field: { marginBottom: spacing.lg },
  sectionLabel: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  communityList: { gap: spacing.md, marginBottom: spacing.lg },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md + 2,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  communitySelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  communityLabel: { ...typography.bodyMedium, color: colors.text },
  communityLabelSelected: { color: colors.primaryDark, fontFamily: 'PlusJakartaSans-Bold' },
  errorText: { ...typography.small, color: colors.error, marginBottom: spacing.md },
});

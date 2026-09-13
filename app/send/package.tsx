import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { IconBadge } from '@/components/IconBadge';
import { StepHeader } from '@/components/StepHeader';
import { useDraft } from '@/contexts/DraftContext';
import type { PackageCategory, PackageSize } from '@/types';

const CATEGORIES: { value: PackageCategory; label: string; emoji: string; color: string; light: string }[] = [
  { value: 'document', label: 'Document', emoji: '📄', color: colors.sky, light: colors.skyLight },
  { value: 'clothing', label: 'Clothing', emoji: '👕', color: colors.purple, light: colors.purpleLight },
  { value: 'gift', label: 'Gift', emoji: '🎁', color: colors.pink, light: colors.pinkLight },
  { value: 'other', label: 'Other', emoji: '📦', color: colors.primaryDark, light: colors.primarySoft },
  // { value: 'spare_part', label: 'Spare Part', emoji: '🔧', color: colors.teal, light: colors.tealLight },
  { value: 'food', label: 'Food', emoji: '🍔', color: colors.coral, light: colors.coralLight },
];

const SIZES: { value: PackageSize; label: string; weight: string; description: string }[] = [
  { value: 'small', label: 'Small', weight: 'Up to 2kg', description: 'Fits in a pocket or small pouch' },
  { value: 'medium', label: 'Medium', weight: '2 – 5kg', description: 'Fits in a backpack or handbag' },
  { value: 'large', label: 'Large', weight: '5 – 10kg', description: 'Fits in a large bag or box' },
];

export default function PackageScreen() {
  const { draft, updateDraft } = useDraft();
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!draft.packageCategory) {
      setError('Please select a package category');
      return;
    }
    if (!draft.packageSize) {
      setError('Please select a package size');
      return;
    }
    setError(null);
    router.push('/send/pickup');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StepHeader step={0} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <IconBadge style={styles.iconBadge} background={colors.purpleLight}>
          <Text style={styles.iconEmoji}>📦</Text>
        </IconBadge>
        <Text style={styles.title}>What are you sending?</Text>

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const selected = draft.packageCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                activeOpacity={0.85}
                style={[styles.categoryCard, selected && { borderColor: cat.color, backgroundColor: cat.light }]}
                onPress={() => {
                  updateDraft({ packageCategory: cat.value });
                  setError(null);
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

        <Text style={styles.sectionLabel}>Size</Text>
        <View style={styles.sizeList}>
          {SIZES.map((sz) => {
            const selected = draft.packageSize === sz.value;
            return (
              <TouchableOpacity
                key={sz.value}
                activeOpacity={0.85}
                style={[styles.sizeCard, selected && styles.sizeSelected]}
                onPress={() => {
                  updateDraft({ packageSize: sz.value });
                  setError(null);
                }}
              >
                <View style={styles.sizeHeader}>
                  <Text style={[styles.sizeLabel, selected && styles.sizeLabelSelected]}>{sz.label}</Text>
                  <View style={[styles.weightBadge, selected && styles.weightBadgeSelected]}>
                    <Text style={[styles.weightBadgeText, selected && styles.weightBadgeTextSelected]}>{sz.weight}</Text>
                  </View>
                </View>
                <Text style={[styles.sizeDescription, selected && styles.sizeDescriptionSelected]}>
                  {sz.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.descriptionContainer}>
          <Input
            label="Description (optional)"
            placeholder="e.g. Blue envelope with documents"
            value={draft.packageDescription}
            onChangeText={(v) => updateDraft({ packageDescription: v })}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button label="Continue" onPress={handleContinue} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  iconBadge: { alignSelf: 'flex-start', marginBottom: spacing.md },
  iconEmoji: { fontSize: 26 },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  categoryCard: {
    width: '48%',
    flexGrow: 1,
    padding: spacing.md + 2,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryEmoji: { fontSize: 22 },
  categoryLabel: { ...typography.captionMedium, color: colors.text },
  sizeList: { gap: spacing.sm, marginBottom: spacing.xl },
  sizeCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  sizeSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  sizeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sizeLabel: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-SemiBold' },
  sizeLabelSelected: { color: colors.primaryDark, fontFamily: 'PlusJakartaSans-Bold' },
  weightBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  weightBadgeSelected: { backgroundColor: colors.primary },
  weightBadgeText: { ...typography.small, color: colors.textSecondary, fontFamily: 'PlusJakartaSans-SemiBold' },
  weightBadgeTextSelected: { color: colors.white },
  sizeDescription: { ...typography.small, color: colors.textSecondary, textAlign: 'left', lineHeight: 18, marginTop: 4 },
  sizeDescriptionSelected: { color: colors.primaryDark },
  descriptionContainer: { marginBottom: spacing.lg },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  errorText: { ...typography.small, color: colors.error, marginBottom: spacing.md },
});

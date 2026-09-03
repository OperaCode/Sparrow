import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useDraft } from '@/contexts/DraftContext';
import { ArrowLeft } from 'lucide-react-native';
import { ProgressDots } from './pickup';
import type { PackageCategory, PackageSize } from '@/types';

const CATEGORIES: { value: PackageCategory; label: string; icon: string }[] = [
  { value: 'document', label: 'Document', icon: '📄' },
  { value: 'food', label: 'Food', icon: '🍱' },
  { value: 'clothing', label: 'Clothing', icon: '👕' },
  { value: 'gift', label: 'Gift', icon: '🎁' },
  { value: 'spare_part', label: 'Spare Part', icon: '🔧' },
  { value: 'other', label: 'Other', icon: '📦' },
];

const SIZES: { value: PackageSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
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
    router.push('/send/summary');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft color={colors.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <ProgressDots step={2} />
      </View>

      <Text style={styles.bird}>📦</Text>
      <Text style={styles.title}>What are you sending?</Text>

      <Text style={styles.sectionLabel}>Category</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            activeOpacity={0.85}
            style={[styles.categoryCard, draft.packageCategory === cat.value && styles.categorySelected]}
            onPress={() => {
              updateDraft({ packageCategory: cat.value });
              setError(null);
            }}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[styles.categoryLabel, draft.packageCategory === cat.value && styles.categoryLabelSelected]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Size</Text>
      <View style={sizeRowStyles.row}>
        {SIZES.map((sz) => (
          <TouchableOpacity
            key={sz.value}
            activeOpacity={0.85}
            style={[styles.sizeCard, draft.packageSize === sz.value && styles.sizeSelected]}
            onPress={() => {
              updateDraft({ packageSize: sz.value });
              setError(null);
            }}
          >
            <Text style={[styles.sizeLabel, draft.packageSize === sz.value && styles.sizeLabelSelected]}>
              {sz.label}
            </Text>
          </TouchableOpacity>
        ))}
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
  );
}

const sizeRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
  bird: { fontSize: 40, marginBottom: spacing.sm },
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
  categorySelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  categoryIcon: { fontSize: 28 },
  categoryLabel: { ...typography.captionMedium, color: colors.text },
  categoryLabelSelected: { color: colors.primaryDark, fontFamily: 'PlusJakartaSans-Bold' },
  sizeCard: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  sizeSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  sizeLabel: { ...typography.bodyMedium, color: colors.text },
  sizeLabelSelected: { color: colors.primaryDark, fontFamily: 'PlusJakartaSans-Bold' },
  descriptionContainer: { marginBottom: spacing.lg },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  errorText: { ...typography.small, color: colors.error, marginBottom: spacing.md },
});

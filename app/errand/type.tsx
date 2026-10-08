import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useErrandCart } from '@/contexts/ErrandCartContext';

const ERRAND_TYPES = [
  {
    key: 'groceries' as const,
    emoji: '🛒',
    title: 'Groceries',
    subtitle: "Buy groceries from Sparrow's available catalogue",
    color: colors.teal,
    light: colors.tealLight,
  },
  {
    key: 'food' as const,
    emoji: '🍲',
    title: 'Food',
    subtitle: 'Order food from selected Sparrow food vendors',
    color: colors.coral,
    light: colors.coralLight,
  },
  {
    key: 'other' as const,
    emoji: '📦',
    title: 'Other Errand',
    subtitle: 'Request another supported or manual errand',
    color: colors.purple,
    light: colors.purpleLight,
  },
];

export default function ErrandTypeScreen() {
  const { startService } = useErrandCart();

  const handleSelect = (key: (typeof ERRAND_TYPES)[number]['key']) => {
    if (key === 'groceries') {
      startService('groceries');
      router.push('/errand/groceries-categories');
    } else if (key === 'food') {
      startService('food');
      router.push('/errand/food-vendors');
    } else {
      router.push('/errand/request');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What do you need?</Text>
        <Text style={styles.subtitle}>Choose an errand type and we'll take it from there.</Text>

        <View style={styles.list}>
          {ERRAND_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              activeOpacity={0.85}
              style={styles.card}
              onPress={() => handleSelect(type.key)}
            >
              <View style={[styles.iconBadge, { backgroundColor: type.light }]}>
                <Text style={styles.iconEmoji}>{type.emoji}</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{type.title}</Text>
                <Text style={styles.cardSubtitle}>{type.subtitle}</Text>
              </View>
              <ChevronRight color={colors.textTertiary} size={20} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 22 },
  list: { gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 24 },
  cardText: { flex: 1 },
  cardTitle: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold', marginBottom: 2 },
  cardSubtitle: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
});

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrandCartBar } from '@/components/ErrandCartBar';
import { useErrandCart } from '@/contexts/ErrandCartContext';
import { GROCERY_CATEGORIES } from '@/lib/errandCatalog';

export default function GroceryCategoriesScreen() {
  const { itemCount, goodsSubtotal } = useErrandCart();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Groceries" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Browse categories</Text>
        <Text style={styles.subtitle}>
          Pick from Sparrow's curated grocery catalogue — we'll source it for you.
        </Text>

        <View style={styles.grid}>
          {GROCERY_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.85}
              style={styles.card}
              onPress={() =>
                router.push({ pathname: '/errand/groceries-products', params: { categoryId: category.id } })
              }
            >
              <Text style={styles.emoji}>{category.emoji}</Text>
              <Text style={styles.cardLabel}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ErrandCartBar
        itemCount={itemCount}
        subtotal={goodsSubtotal}
        onPress={() => router.push('/errand/groceries-cart')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl + spacing.xl },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm + 2 },
  card: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: { fontSize: 32 },
  cardLabel: { ...typography.captionMedium, color: colors.text, textAlign: 'center' },
});

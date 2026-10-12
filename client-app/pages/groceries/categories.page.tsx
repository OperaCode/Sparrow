import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/headers/screen.header';
import { ErrandCartBar } from '@/components/containers/cart.bar';
import { Loading } from '@/components/containers/loading.container';
import { useErrandCart } from '@/contexts/errand-cart.context';
import { useGroceryCategories } from '@/hooks/grocery.hook';

export default function GroceryCategoriesScreen() {
  const { itemCount, goodsSubtotal } = useErrandCart();
  const { categories, failed } = useGroceryCategories();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Groceries" />

      {categories === null && !failed ? <Loading /> : null}

      {failed ? (
        <Text style={styles.message}>Sparrow's catalogue could not be loaded.</Text>
      ) : null}

      {categories !== null ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Browse categories</Text>
          <Text style={styles.subtitle}>
            Pick from Sparrow's catalogue. We'll source it for you.
          </Text>
          <View style={styles.grid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                activeOpacity={0.85}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/errand/groceries-products',
                    params: { categoryId: category.id, categoryName: category.name },
                  })
                }
              >
                <Text style={styles.emoji}>{category.emoji}</Text>
                <Text style={styles.cardLabel}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : null}

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
  message: { ...typography.body, color: colors.textSecondary, padding: spacing.lg },
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

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrandCartBar } from '@/components/ErrandCartBar';
import { QuantityStepper } from '@/components/QuantityStepper';
import { Badge } from '@/components/Badge';
import { useErrandCart } from '@/contexts/ErrandCartContext';
import { getGroceryCategoryById, getGroceryProductsByCategory } from '@/lib/errandCatalog';

export default function GroceryProductsScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const category = getGroceryCategoryById(categoryId ?? '');
  const products = getGroceryProductsByCategory(categoryId ?? '');
  const { itemCount, goodsSubtotal, getQuantity, addItem, decrementItem } = useErrandCart();

  return (
    <View style={styles.container}>
      <ScreenHeader title={category?.name ?? 'Products'} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {products.map((product) => {
          const quantity = getQuantity(product.id);
          return (
            <View key={product.id} style={[styles.card, !product.isAvailable && styles.cardUnavailable]}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardEmoji}>{category?.emoji ?? '🛒'}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{product.name}</Text>
                <Text style={styles.cardUnit}>{product.unit}</Text>
                <Text style={styles.cardPrice}>₦{product.price.toLocaleString()}</Text>
              </View>
              {product.isAvailable ? (
                <QuantityStepper
                  quantity={quantity}
                  onIncrement={() =>
                    addItem({ itemId: product.id, itemType: 'grocery', name: product.name, unit: product.unit, unitPrice: product.price })
                  }
                  onDecrement={() => decrementItem(product.id)}
                />
              ) : (
                <Badge label="Unavailable" variant="neutral" />
              )}
            </View>
          );
        })}
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
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl + spacing.xl, gap: spacing.sm + 2 },
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
  cardUnavailable: { opacity: 0.55 },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 20 },
  cardInfo: { flex: 1 },
  cardName: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-SemiBold' },
  cardUnit: { ...typography.small, color: colors.textTertiary, marginTop: 1 },
  cardPrice: { ...typography.captionMedium, color: colors.primaryDark, marginTop: 2 },
});

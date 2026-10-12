import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/headers/screen.header';
import { ErrandCartBar } from '@/components/containers/cart.bar';
import { QuantityStepper } from '@/components/inputs/quantity.input';
import { Loading } from '@/components/containers/loading.container';
import { useErrandCart } from '@/contexts/errand-cart.context';
import { useGroceryProducts } from '@/hooks/grocery.hook';

export default function GroceryProductsScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();
  const { products, failed } = useGroceryProducts(categoryId ?? '');
  const { itemCount, goodsSubtotal, getQuantity, addItem, decrementItem } = useErrandCart();

  return (
    <View style={styles.container}>
      <ScreenHeader title={categoryName ?? 'Products'} />

      {products === null && !failed ? <Loading /> : null}
      {failed ? <Text style={styles.message}>These products could not be loaded.</Text> : null}

      {products !== null ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {products.length === 0 ? (
            <Text style={styles.message}>Nothing is available in this category right now.</Text>
          ) : null}
          {products.map((product) => (
            <View key={product.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{product.name}</Text>
                <Text style={styles.cardUnit}>{product.unit}</Text>
                <Text style={styles.cardPrice}>₦{product.priceNaira.toLocaleString()}</Text>
              </View>
              <QuantityStepper
                quantity={getQuantity(product.id)}
                onIncrement={() =>
                  addItem({
                    itemId: product.id,
                    itemType: 'grocery',
                    name: product.name,
                    unit: product.unit,
                    unitPrice: product.priceNaira,
                  })
                }
                onDecrement={() => decrementItem(product.id)}
              />
            </View>
          ))}
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
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl + spacing.xl, gap: spacing.sm + 2 },
  message: { ...typography.body, color: colors.textSecondary, padding: spacing.lg },
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
  cardInfo: { flex: 1 },
  cardName: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-SemiBold' },
  cardUnit: { ...typography.small, color: colors.textTertiary, marginTop: 1 },
  cardPrice: { ...typography.captionMedium, color: colors.primaryDark, marginTop: 2 },
});

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrandCartBar } from '@/components/ErrandCartBar';
import { QuantityStepper } from '@/components/QuantityStepper';
import { Badge } from '@/components/Badge';
import { useErrandCart } from '@/contexts/ErrandCartContext';
import { getFoodVendorById, getFoodItemsByVendor } from '@/lib/errandCatalog';

export default function FoodMenuScreen() {
  const { vendorId } = useLocalSearchParams<{ vendorId: string }>();
  const vendor = getFoodVendorById(vendorId ?? '');
  const items = getFoodItemsByVendor(vendorId ?? '');
  const { itemCount, goodsSubtotal, getQuantity, addItem, decrementItem } = useErrandCart();

  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <View style={styles.container}>
      <ScreenHeader title={vendor?.name ?? 'Menu'} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category}</Text>
            {items
              .filter((i) => i.category === category)
              .map((item) => {
                const quantity = getQuantity(item.id);
                return (
                  <View key={item.id} style={[styles.card, !item.isAvailable && styles.cardUnavailable]}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName}>{item.name}</Text>
                      {item.description ? <Text style={styles.cardDescription}>{item.description}</Text> : null}
                      <Text style={styles.cardPrice}>₦{item.price.toLocaleString()}</Text>
                    </View>
                    {item.isAvailable ? (
                      <QuantityStepper
                        quantity={quantity}
                        onIncrement={() =>
                          addItem({ itemId: item.id, itemType: 'food', name: item.name, unit: null, unitPrice: item.price })
                        }
                        onDecrement={() => decrementItem(item.id)}
                      />
                    ) : (
                      <Badge label="Unavailable" variant="neutral" />
                    )}
                  </View>
                );
              })}
          </View>
        ))}
      </ScrollView>

      <ErrandCartBar itemCount={itemCount} subtotal={goodsSubtotal} onPress={() => router.push('/errand/food-cart')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl + spacing.xl },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardUnavailable: { opacity: 0.55 },
  cardInfo: { flex: 1 },
  cardName: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-SemiBold' },
  cardDescription: { ...typography.small, color: colors.textSecondary, marginTop: 1 },
  cardPrice: { ...typography.captionMedium, color: colors.primaryDark, marginTop: 2 },
});

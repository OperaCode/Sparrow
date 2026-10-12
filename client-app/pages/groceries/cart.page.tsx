import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/headers/screen.header';
import { QuantityStepper } from '@/components/inputs/quantity.input';
import { EmptyState } from '@/components/containers/empty.container';
import { Button } from '@/components/buttons/button';
import { useErrandCart } from '@/contexts/errand-cart.context';
import { useGroceryQuote } from '@/hooks/grocery.hook';
import { GroceryBillCard } from '@/pages/groceries/partials/bill.card';

export default function GroceriesCartScreen() {
  const { items, goodsSubtotal, incrementItem, decrementItem } = useErrandCart();
  const lines = useMemo(
    () => items.map((item) => ({ productId: item.itemId, quantity: item.quantity })),
    [items],
  );
  const { quote, failed } = useGroceryQuote(lines);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Your Groceries" />

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Browse the catalogue and add groceries to get started."
          style={styles.empty}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.itemsCard}>
            {items.map((item) => (
              <View key={item.itemId} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemUnit}>
                    {item.unit ? `${item.unit} · ` : ''}₦{item.unitPrice.toLocaleString()} each
                  </Text>
                </View>
                <QuantityStepper
                  quantity={item.quantity}
                  onIncrement={() => incrementItem(item)}
                  onDecrement={() => decrementItem(item.itemId)}
                />
                <Text style={styles.itemSubtotal}>
                  ₦{(item.unitPrice * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

          <GroceryBillCard goodsNaira={goodsSubtotal} quote={quote} failed={failed} />

          <Button
            label="Continue to Delivery Address"
            disabled={quote === null}
            onPress={() => router.push('/errand/address')}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  empty: { flex: 1, justifyContent: 'center' },
  itemsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemInfo: { flex: 1 },
  itemName: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-SemiBold' },
  itemUnit: { ...typography.small, color: colors.textTertiary, marginTop: 1 },
  itemSubtotal: {
    ...typography.captionMedium,
    color: colors.text,
    fontFamily: 'PlusJakartaSans-Bold',
    minWidth: 64,
    textAlign: 'right',
  },
});

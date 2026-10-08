import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { QuantityStepper } from '@/components/QuantityStepper';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { useErrandCart } from '@/contexts/ErrandCartContext';
import { ERRAND_CART_SERVICE_FEE, ERRAND_CART_DELIVERY_FEE } from '@/lib/pricing';

export default function FoodCartScreen() {
  const { items, goodsSubtotal, vendorName, incrementItem, decrementItem } = useErrandCart();
  const total = goodsSubtotal + ERRAND_CART_SERVICE_FEE + ERRAND_CART_DELIVERY_FEE;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Your Order" />

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          message="Browse the menu and add items to get started."
          style={styles.empty}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {vendorName ? <Text style={styles.vendorLabel}>{vendorName}</Text> : null}

          <View style={styles.itemsCard}>
            {items.map((item) => (
              <View key={item.itemId} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemUnit}>₦{item.unitPrice.toLocaleString()} each</Text>
                </View>
                <QuantityStepper
                  quantity={item.quantity}
                  onIncrement={() => incrementItem(item)}
                  onDecrement={() => decrementItem(item.itemId)}
                />
                <Text style={styles.itemSubtotal}>₦{(item.unitPrice * item.quantity).toLocaleString()}</Text>
              </View>
            ))}
          </View>

          <View style={styles.feeCard}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Food subtotal</Text>
              <Text style={styles.feeValue}>₦{goodsSubtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Sparrow Errand Fee</Text>
              <Text style={styles.feeValue}>₦{ERRAND_CART_SERVICE_FEE.toLocaleString()}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Delivery</Text>
              <Text style={styles.feeValue}>₦{ERRAND_CART_DELIVERY_FEE.toLocaleString()}</Text>
            </View>
            <View style={styles.feeDivider} />
            <View style={styles.feeRow}>
              <Text style={styles.feeTotalLabel}>TOTAL</Text>
              <Text style={styles.feeTotalValue}>₦{total.toLocaleString()}</Text>
            </View>
          </View>

          <Button label="Continue to Delivery Address" onPress={() => router.push('/errand/address')} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  empty: { flex: 1, justifyContent: 'center' },
  vendorLabel: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.sm },
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
  itemSubtotal: { ...typography.captionMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold', minWidth: 64, textAlign: 'right' },
  feeCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.xl,
  },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  feeLabel: { ...typography.captionMedium, color: colors.primaryDark },
  feeValue: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold' },
  feeDivider: { height: 1, backgroundColor: 'rgba(217,119,6,0.2)', marginVertical: spacing.xs },
  feeTotalLabel: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold' },
  feeTotalValue: { ...typography.h3, color: colors.text },
});

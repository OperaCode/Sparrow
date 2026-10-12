import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/buttons/button';
import { ScreenHeader } from '@/components/headers/screen.header';
import { useErrandCart } from '@/contexts/errand-cart.context';
import { useAuth } from '@/contexts/auth.context';
import { useDeliveries } from '@/contexts/deliveries.context';
import { ERRAND_CART_SERVICE_FEE, ERRAND_CART_DELIVERY_FEE } from '@/lib/pricing';
import { useGroceryQuote } from '@/hooks/grocery.hook';
import type { DeliveryDraft } from '@/contexts/draft.context';

export default function ErrandSummaryScreen() {
  const cart = useErrandCart();
  const { profile } = useAuth();
  const { addDelivery } = useDeliveries();
  const [submitting, setSubmitting] = useState(false);
  const isFood = cart.service === 'food';
  const groceryLines = useMemo(
    () =>
      isFood
        ? []
        : cart.items.map((item) => ({ productId: item.itemId, quantity: item.quantity })),
    [cart.items, isFood],
  );
  const { quote, failed } = useGroceryQuote(groceryLines);
  const serviceFee = isFood ? ERRAND_CART_SERVICE_FEE : quote?.serviceNaira;
  const deliveryFee = isFood ? ERRAND_CART_DELIVERY_FEE : quote?.deliveryNaira;
  const goods = isFood ? cart.goodsSubtotal : (quote?.goodsNaira ?? cart.goodsSubtotal);
  const total = isFood ? cart.goodsSubtotal + ERRAND_CART_SERVICE_FEE + ERRAND_CART_DELIVERY_FEE : quote?.totalNaira;

  const handleSubmit = () => {
    if (!isFood && total === undefined) return;
    setSubmitting(true);

    const itemsDescription = cart.items.map((i) => `${i.name} x${i.quantity}`).join(', ');

    const draft: DeliveryDraft = {
      pickupAddress: isFood ? `${cart.vendorName} (Sparrow Food Vendor)` : "Sparrow's Grocery Catalogue",
      pickupLandmark: '',
      pickupContactName: cart.vendorName ?? 'Sparrow Operations',
      pickupContactPhone: '080 000 0000',
      pickupLatitude: null,
      pickupLongitude: null,
      destinationAddress: cart.destinationAddress,
      destinationLandmark: cart.destinationLandmark,
      destinationContactName: cart.destinationContactName,
      destinationContactPhone: cart.destinationContactPhone,
      destinationLatitude: null,
      destinationLongitude: null,
      packageCategory: isFood ? 'food' : 'other',
      packageDescription: itemsDescription,
      packageSize: 'medium',
      packagePhotoUrl: null,
      pickupZone: profile?.community ?? null,
      destinationZone: profile?.community ?? null,
      price: total ?? 0,
      serviceType: 'errand',
      zoneTier: null,
      pricingStatus: 'auto',
      itemLocation: 'elsewhere',
      specialPickupZone: null,
      specialPickupTier: null,
      specialPickupFee: null,
      errandCategory: isFood ? 'food_pickup' : 'groceries',
      errandTier: 'simple',
      errandFee: serviceFee ?? ERRAND_CART_SERVICE_FEE,
      estimatedItemCost: goods,
    };

    const delivery = addDelivery(draft, profile?.id ?? 'mock-user-id');
    cart.clearCart();
    setSubmitting(false);

    router.replace({
      pathname: '/errand/confirmation',
      params: {
        deliveryId: delivery.id,
        deliveryCode: delivery.delivery_code,
        total: (total ?? 0).toLocaleString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Order Summary" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Row label="SERVICE" value={isFood ? 'Food' : 'Groceries'} />
          {isFood && cart.vendorName ? <Row label="VENDOR" value={cart.vendorName} /> : null}

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>ITEMS</Text>
          {cart.items.map((item) => (
            <View key={item.itemId} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={styles.itemValue}>₦{(item.unitPrice * item.quantity).toLocaleString()}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <Row label={isFood ? 'FOOD SUBTOTAL' : 'GOODS'} value={`₦${goods.toLocaleString()}`} />
          <Row label="SERVICE FEE" value={serviceFee === undefined ? '…' : `₦${serviceFee.toLocaleString()}`} />
          <Row label="DELIVERY" value={deliveryFee === undefined ? '…' : `₦${deliveryFee.toLocaleString()}`} />
          {failed ? <Text style={styles.quoteError}>The price could not be loaded.</Text> : null}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{total === undefined ? '…' : `₦${total.toLocaleString()}`}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>DELIVERING TO</Text>
          <Text style={styles.addressText}>{cart.destinationAddress}</Text>
          {cart.destinationLandmark ? <Text style={styles.addressSub}>{cart.destinationLandmark}</Text> : null}
          <Text style={styles.addressSub}>
            {cart.destinationContactName} · {cart.destinationContactPhone}
          </Text>
        </View>

        <Button
          label="Send to Sparrow"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!isFood && total === undefined}
        />
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.lg,
  },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.sm + 2 },
  sectionLabel: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  rowLabel: { ...typography.label, color: colors.textTertiary },
  rowValue: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-SemiBold' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  itemName: { ...typography.body, color: colors.text, flex: 1 },
  itemValue: { ...typography.captionMedium, color: colors.textSecondary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold' },
  totalValue: { ...typography.h3, color: colors.text },
  addressText: { ...typography.body, color: colors.text, marginTop: 2 },
  addressSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  quoteError: { ...typography.caption, color: colors.error, marginTop: spacing.sm },
});

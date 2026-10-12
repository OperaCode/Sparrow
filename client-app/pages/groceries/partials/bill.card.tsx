import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { GroceryQuote } from '@/lib/grocery.api';

function naira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

export function GroceryBillCard({
  goodsNaira,
  quote,
  failed,
}: {
  goodsNaira: number;
  quote: GroceryQuote | null;
  failed: boolean;
}) {
  const goods = quote?.goodsNaira ?? goodsNaira;
  const service = quote === null ? null : quote.serviceNaira;
  const delivery = quote === null ? null : quote.deliveryNaira;
  const total = quote?.totalNaira ?? null;

  return (
    <View style={styles.card}>
      <Row label="Goods" value={naira(goods)} />
      <Row label="Service fee" value={service === null ? '…' : naira(service)} />
      <Row label="Delivery" value={delivery === null ? '…' : naira(delivery)} />
      <View style={styles.divider} />
      <Row label="Total" value={total === null ? '…' : naira(total)} strong />
      {failed ? <Text style={styles.errorText}>The price could not be loaded. Check that the API is running.</Text> : null}
    </View>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={strong ? styles.totalLabel : styles.label}>{label}</Text>
      <Text style={strong ? styles.totalValue : styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  label: { ...typography.captionMedium, color: colors.primaryDark },
  value: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold' },
  divider: { height: 1, backgroundColor: 'rgba(217,119,6,0.2)', marginVertical: spacing.xs },
  totalLabel: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold' },
  totalValue: { ...typography.h3, color: colors.text },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.sm },
});

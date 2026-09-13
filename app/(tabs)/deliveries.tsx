import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { PackageSearch } from 'lucide-react-native';
import { SparrowLogo } from '@/components/SparrowLogo';
import { useDeliveries } from '@/contexts/DeliveriesContext';

const STATUS_VARIANT: Record<string, 'success' | 'info' | 'warning' | 'error' | 'neutral' | 'primary'> = {
  delivered: 'success',
  in_transit: 'info',
  rider_assigned: 'info',
  picked_up: 'info',
  arrived: 'warning',
  pending_manual_quote: 'warning',
  awaiting_payment: 'warning',
  payment_submitted: 'warning',
  payment_confirmed: 'primary',
  cancelled: 'error',
  delivery_failed: 'error',
};

export default function DeliveriesScreen() {
  const { deliveries } = useDeliveries();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <SparrowLogo size={18} color={colors.primary} />
          <Text style={styles.brandLabel}>Sparrow</Text>
        </View>
        <Text style={styles.title}>My Deliveries</Text>
      </View>

      {deliveries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon={<PackageSearch color={colors.primaryDark} size={28} strokeWidth={1.75} />}
            title="Nothing here yet."
            message="Your Sparrow deliveries will appear here."
          />
          <Button label="Send Your First Package" onPress={() => router.push('/send/package')} style={styles.emptyBtn} />
        </View>
      ) : (
        <FlatList
          data={deliveries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/delivery/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.deliveryCode}>{item.delivery_code}</Text>
                <Badge
                  label={item.status.replace(/_/g, ' ')}
                  variant={STATUS_VARIANT[item.status] || 'neutral'}
                />
              </View>
              <View style={styles.route}>
                <Text style={styles.routePlace} numberOfLines={1}>{item.pickup_address.split(',')[0]}</Text>
                <Text style={styles.routeArrow}>→</Text>
                <Text style={styles.routePlace} numberOfLines={1}>{item.destination_address.split(',')[0]}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>
                  {item.price != null ? `₦${Number(item.price).toLocaleString()}` : 'Pending quote'}
                </Text>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  brandLabel: { ...typography.captionMedium, color: colors.primaryDark },
  title: { ...typography.h1, color: colors.text },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyBtn: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deliveryCode: { ...typography.captionMedium, color: colors.textSecondary, fontFamily: 'PlusJakartaSans-Bold' },
  route: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  routePlace: { ...typography.body, color: colors.text, flex: 1 },
  routeArrow: { ...typography.body, color: colors.textTertiary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  price: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold' },
  date: { ...typography.small, color: colors.textTertiary },
});

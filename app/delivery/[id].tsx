import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { DeliveryMap } from '@/components/DeliveryMap';
import { RatingModal } from '@/components/RatingModal';
import { ArrowLeft, MapPin, Package, Phone, User, SearchX, Star, PhoneCall, MessageCircle } from 'lucide-react-native';
import { useDeliveries } from '@/contexts/DeliveriesContext';
import type { Delivery, DeliveryStatus } from '@/types';

const STATUS_STEPS: { status: DeliveryStatus; label: string }[] = [
  { status: 'payment_confirmed', label: 'Payment confirmed' },
  { status: 'rider_assigned', label: 'Rider assigned' },
  { status: 'picked_up', label: 'Package picked up' },
  { status: 'in_transit', label: 'In transit' },
  { status: 'delivered', label: 'Delivered' },
];

function getStatusIndex(status: DeliveryStatus): number {
  const order: DeliveryStatus[] = [
    'draft', 'requested', 'pending_manual_quote', 'awaiting_payment', 'payment_submitted',
    'payment_confirmed', 'ready_for_dispatch', 'rider_assigned',
    'picked_up', 'in_transit', 'arrived', 'pin_verified', 'delivered',
  ];
  return order.indexOf(status);
}

export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { deliveries, getDeliveryById, rateDelivery, cancelDelivery } = useDeliveries();
  const delivery: Delivery | null = id ? getDeliveryById(id) : deliveries[0] ?? null;
  const [ratingModalVisible, setRatingModalVisible] = useState(false);

  if (!delivery) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft color={colors.text} size={24} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <EmptyState
          icon={<SearchX color={colors.primaryDark} size={28} strokeWidth={1.75} />}
          title="Delivery not found"
          message="This delivery may have been cancelled or removed."
        />
      </View>
    );
  }

  const currentStepIndex = getStatusIndex(delivery.status);
  const pickedUpIndex = getStatusIndex('picked_up');
  const deliveredIndex = getStatusIndex('delivered');
  const isPickedUpOrLater = currentStepIndex >= pickedUpIndex;
  const progress = delivery.status === 'delivered'
    ? 1
    : isPickedUpOrLater
      ? Math.min(1, (currentStepIndex - pickedUpIndex) / (deliveredIndex - pickedUpIndex))
      : 0;
  const hasCoordinates =
    delivery.pickup_latitude != null &&
    delivery.pickup_longitude != null &&
    delivery.destination_latitude != null &&
    delivery.destination_longitude != null;
  const isCancellable = currentStepIndex >= 0 && currentStepIndex < pickedUpIndex;
  const isCancelled = delivery.status === 'cancelled';

  const handleCancel = () => {
    Alert.alert(
      'Cancel this delivery?',
      'Your Sparrow will be notified and the delivery will be stopped.',
      [
        { text: 'Keep it', style: 'cancel' },
        { text: 'Cancel delivery', style: 'destructive', onPress: () => cancelDelivery(delivery.id) },
      ],
    );
  };

  const handleCall = () => {
    if (delivery.rider_phone) Linking.openURL(`tel:${delivery.rider_phone.replace(/\s/g, '')}`);
  };

  const handleMessage = () => {
    if (delivery.rider_phone) Linking.openURL(`sms:${delivery.rider_phone.replace(/\s/g, '')}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft color={colors.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.deliveryCode}>{delivery.delivery_code}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.routeSummary}>
        <Text style={styles.routeText}>
          {delivery.pickup_address.split(',')[0]} → {delivery.destination_address.split(',')[0]}
        </Text>
      </View>

      {isCancelled && (
        <View style={styles.cancelledBanner}>
          <Text style={styles.cancelledText}>This delivery was cancelled.</Text>
        </View>
      )}

      {delivery.rider_name && !isCancelled && (
        <View style={styles.riderCard}>
          <View style={styles.riderInfo}>
            <View style={styles.riderAvatar}>
              <Text style={styles.riderAvatarText}>{delivery.rider_name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.riderLabel}>Your Sparrow</Text>
              <Text style={styles.riderName}>{delivery.rider_name}</Text>
            </View>
          </View>
          <View style={styles.riderActions}>
            <TouchableOpacity style={styles.riderActionBtn} activeOpacity={0.85} onPress={handleMessage} hitSlop={4}>
              <MessageCircle color={colors.primaryDark} size={18} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.riderActionBtn} activeOpacity={0.85} onPress={handleCall} hitSlop={4}>
              <PhoneCall color={colors.primaryDark} size={18} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {hasCoordinates && (
        <View style={styles.mapWrap}>
          <DeliveryMap
            pickup={{ latitude: delivery.pickup_latitude!, longitude: delivery.pickup_longitude! }}
            destination={{ latitude: delivery.destination_latitude!, longitude: delivery.destination_longitude! }}
            progress={progress}
            showRider={isPickedUpOrLater && delivery.status !== 'delivered'}
          />
        </View>
      )}

      <View style={styles.timelineCard}>
        {STATUS_STEPS.map((step, index) => {
          const stepIndex = getStatusIndex(step.status);
          const isDone = currentStepIndex >= stepIndex && currentStepIndex !== -1;
          const isCurrent = delivery.status === step.status;
          const isLast = index === STATUS_STEPS.length - 1;

          return (
            <View key={step.status} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, isDone && styles.timelineDotDone, isCurrent && styles.timelineDotCurrent]} />
                {!isLast && <View style={[styles.timelineLine, isDone && styles.timelineLineDone]} />}
              </View>
              <Text style={[styles.timelineLabel, isDone && styles.timelineLabelDone, isCurrent && styles.timelineLabelCurrent]}>
                {step.label}
                {isCurrent && ' ●'}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Pickup</Text>
        <DetailRow icon={<MapPin color={colors.textSecondary} size={16} strokeWidth={2} />} text={delivery.pickup_address} />
        {delivery.pickup_landmark ? <Text style={styles.detailSub}>{delivery.pickup_landmark}</Text> : null}
        <DetailRow icon={<User color={colors.textSecondary} size={16} strokeWidth={2} />} text={delivery.pickup_contact_name} />
        <DetailRow icon={<Phone color={colors.textSecondary} size={16} strokeWidth={2} />} text={delivery.pickup_contact_phone} />

        <View style={styles.detailDivider} />

        <Text style={styles.detailTitle}>Destination</Text>
        <DetailRow icon={<MapPin color={colors.textSecondary} size={16} strokeWidth={2} />} text={delivery.destination_address} />
        {delivery.destination_landmark ? <Text style={styles.detailSub}>{delivery.destination_landmark}</Text> : null}
        <DetailRow icon={<User color={colors.textSecondary} size={16} strokeWidth={2} />} text={delivery.destination_contact_name} />
        <DetailRow icon={<Phone color={colors.textSecondary} size={16} strokeWidth={2} />} text={delivery.destination_contact_phone} />

        <View style={styles.detailDivider} />

        <Text style={styles.detailTitle}>Package</Text>
        <DetailRow icon={<Package color={colors.textSecondary} size={16} strokeWidth={2} />} text={`${delivery.package_category.replace(/_/g, ' ')} · ${delivery.package_size}`} />
        {delivery.package_description ? <Text style={styles.detailSub}>{delivery.package_description}</Text> : null}

        <View style={styles.detailDivider} />

        <View style={styles.priceRow}>
          <Text style={styles.detailTitle}>Delivery fee</Text>
          <Text style={styles.priceValue}>
            {delivery.price != null ? `₦${Number(delivery.price).toLocaleString()}` : 'Pending quote'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.detailTitle}>Payment</Text>
          <Badge
            label={delivery.payment_status.replace(/_/g, ' ')}
            variant={delivery.payment_status === 'payment_confirmed' ? 'success' : 'warning'}
          />
        </View>
      </View>

      {/*
        The rider displays a QR code to the recipient at the door; scanning it opens a
        public web page where the recipient enters this PIN herself to confirm delivery
        (PRD §11.7). That scan page and its rate limiting are Phase 3 work once Supabase
        RPCs exist — for now this just shows the PIN with the correct framing.
      */}
      {delivery.delivery_pin && delivery.status !== 'delivered' && (
        <View style={styles.pinCard}>
          <Text style={styles.pinLabel}>Delivery PIN</Text>
          <Text style={styles.pinValue}>{delivery.delivery_pin}</Text>
          <Text style={styles.pinNote}>
            The recipient will be asked for this PIN to confirm delivery — make sure they have it.
          </Text>
        </View>
      )}

      {delivery.status === 'delivered' && (
        delivery.rating ? (
          <View style={styles.ratedCard}>
            <View style={styles.ratedStars}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  color={value <= delivery.rating! ? colors.primary : colors.border}
                  fill={value <= delivery.rating! ? colors.primary : 'transparent'}
                  size={18}
                  strokeWidth={1.5}
                />
              ))}
            </View>
            {delivery.rating_comment ? <Text style={styles.ratedComment}>"{delivery.rating_comment}"</Text> : null}
          </View>
        ) : (
          <Button
            label="Rate Sparrow"
            variant="outline"
            onPress={() => setRatingModalVisible(true)}
            style={styles.rateBtn}
          />
        )
      )}

      {isCancellable && (
        <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.85} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel Delivery</Text>
        </TouchableOpacity>
      )}

      <RatingModal
        visible={ratingModalVisible}
        deliveryCode={delivery.delivery_code}
        onClose={() => setRatingModalVisible(false)}
        onSubmit={(rating, comment) => {
          rateDelivery(delivery.id, rating, comment);
          setRatingModalVisible(false);
        }}
      />
    </ScrollView>
  );
}

function DetailRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.detailRow}>
      {icon}
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: spacing.md },
  deliveryCode: { ...typography.h3, color: colors.text, fontFamily: 'PlusJakartaSans-Bold' },
  routeSummary: { marginBottom: spacing.lg },
  routeText: { ...typography.body, color: colors.textSecondary },
  mapWrap: { marginBottom: spacing.lg },
  cancelledBanner: {
    backgroundColor: colors.errorLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cancelledText: { ...typography.bodyMedium, color: colors.error, textAlign: 'center' },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  riderInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderAvatarText: { ...typography.h3, color: colors.primaryDark },
  riderLabel: { ...typography.small, color: colors.textTertiary },
  riderName: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold', marginTop: 2 },
  riderActions: { flexDirection: 'row', gap: spacing.sm },
  riderActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineLeft: { alignItems: 'center', marginRight: spacing.md },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.border },
  timelineDotDone: { backgroundColor: colors.success },
  timelineDotCurrent: { backgroundColor: colors.primary },
  timelineLine: { width: 2, height: 28, backgroundColor: colors.border, marginTop: 4 },
  timelineLineDone: { backgroundColor: colors.success },
  timelineLabel: { ...typography.body, color: colors.textTertiary, marginBottom: 12, flex: 1 },
  timelineLabelDone: { color: colors.text },
  timelineLabelCurrent: { color: colors.primaryDark, fontFamily: 'PlusJakartaSans-SemiBold' },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  detailTitle: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  detailText: { ...typography.body, color: colors.text, flex: 1 },
  detailSub: { ...typography.caption, color: colors.textSecondary, marginLeft: 20, marginBottom: 4 },
  detailDivider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.md },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceValue: { ...typography.h3, color: colors.text, fontFamily: 'PlusJakartaSans-Bold' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  pinCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pinLabel: { ...typography.label, color: colors.primaryDark },
  pinValue: { fontSize: 36, fontFamily: 'PlusJakartaSans-Bold', color: colors.text, letterSpacing: 8, marginTop: spacing.xs },
  pinNote: { ...typography.small, color: colors.textSecondary, marginTop: spacing.xs },
  rateBtn: { marginTop: spacing.sm },
  ratedCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ratedStars: { flexDirection: 'row', gap: 4, marginBottom: spacing.xs },
  ratedComment: { ...typography.caption, color: colors.primaryDark, fontStyle: 'italic', textAlign: 'center' },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.errorLight,
  },
  cancelText: { ...typography.bodyMedium, color: colors.error, fontFamily: 'PlusJakartaSans-SemiBold' },
});

import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  FileText,
  History,
  MoreHorizontal,
  ShieldAlert,
  UserRound,
  X,
  XCircle,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { mockDeliveries } from '@/lib/mockData';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import type { Delivery, DeliveryStatus } from '@/types';

type OpsOrder = Delivery & { failureReason?: string };
type AuditEntry = {
  id: string;
  orderId: string;
  actor: string;
  action: string;
  previousValue: string;
  newValue: string;
  createdAt: string;
};
type PanelKind = 'details' | 'receipt' | 'quote' | 'rider' | 'status' | 'fail' | 'audit';
type Panel = { kind: PanelKind; orderId?: string } | null;

const statusMeta: Record<DeliveryStatus, { label: string; tone: string; background: string }> = {
  draft: { label: 'Draft', tone: colors.textSecondary, background: colors.surfaceAlt },
  requested: { label: 'Requested', tone: colors.info, background: colors.infoLight },
  pending_manual_quote: { label: 'Needs quote', tone: colors.warning, background: colors.warningLight },
  awaiting_payment: { label: 'Awaiting payment', tone: colors.warning, background: colors.warningLight },
  payment_submitted: { label: 'Payment submitted', tone: colors.warning, background: colors.warningLight },
  payment_confirmed: { label: 'Payment confirmed', tone: colors.success, background: colors.successLight },
  ready_for_dispatch: { label: 'Ready for dispatch', tone: colors.info, background: colors.infoLight },
  rider_assigned: { label: 'Rider assigned', tone: colors.purple, background: colors.purpleLight },
  picked_up: { label: 'Picked up', tone: colors.teal, background: colors.tealLight },
  in_transit: { label: 'In transit', tone: colors.teal, background: colors.tealLight },
  arrived: { label: 'Arrived', tone: colors.teal, background: colors.tealLight },
  pin_verified: { label: 'PIN verified', tone: colors.success, background: colors.successLight },
  delivered: { label: 'Delivered', tone: colors.success, background: colors.successLight },
  cancelled: { label: 'Cancelled', tone: colors.error, background: colors.errorLight },
  delivery_failed: { label: 'Exception', tone: colors.error, background: colors.errorLight },
};

const statuses = Object.keys(statusMeta) as DeliveryStatus[];
const riders = [
  { id: 'rider-1', name: 'Tunde Bakare', phone: '080 222 3344', status: 'Available' },
  { id: 'rider-2', name: 'Chidi Okonkwo', phone: '080 444 5566', status: 'On delivery' },
  { id: 'rider-3', name: 'Mariam Bello', phone: '080 333 7788', status: 'Available' },
];
const filterOptions = ['All', 'New orders', 'Payment review', 'Dispatch queue', 'Active', 'Exceptions'] as const;
type FilterOption = (typeof filterOptions)[number];

const initialOrders: OpsOrder[] = [
  {
    ...mockDeliveries[0],
    status: 'payment_submitted',
    payment_status: 'payment_submitted',
    quoted_price: 850,
    price: 850,
  },
  {
    ...mockDeliveries[1],
    status: 'ready_for_dispatch',
    payment_status: 'payment_confirmed',
    quoted_price: 1250,
    price: 1250,
    rider_id: null,
    rider_name: null,
    rider_phone: null,
  },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export default function OperationsScreen() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All');
  const [panel, setPanel] = useState<Panel>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [formError, setFormError] = useState('');
  const isAuthorized = profile?.role === 'admin';
  const selectedOrder = panel?.orderId ? orders.find((order) => order.id === panel.orderId) : undefined;

  const filteredOrders = useMemo(() => orders.filter((order) => {
    switch (selectedFilter) {
      case 'New orders': return ['payment_submitted', 'pending_manual_quote'].includes(order.status);
      case 'Payment review': return order.payment_status === 'payment_submitted';
      case 'Dispatch queue': return order.status === 'ready_for_dispatch';
      case 'Active': return ['rider_assigned', 'picked_up', 'in_transit', 'arrived'].includes(order.status);
      case 'Exceptions': return order.status === 'delivery_failed';
      default: return true;
    }
  }), [orders, selectedFilter]);

  const recordAudit = (order: OpsOrder, action: string, previousValue: string, newValue: string) => {
    setAuditEntries((entries) => [{
      id: `${Date.now()}-${Math.random()}`,
      orderId: order.id,
      actor: profile?.name || profile?.phone || 'Operations admin',
      action,
      previousValue,
      newValue,
      createdAt: new Date().toISOString(),
    }, ...entries]);
  };

  const updateOrder = (order: OpsOrder, changes: Partial<OpsOrder>, action: string, previousValue: string, newValue: string) => {
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, ...changes } : item));
    recordAudit(order, action, previousValue, newValue);
  };

  const updateStatus = (order: OpsOrder, status: DeliveryStatus) => {
    if (status === 'delivery_failed') {
      setFailureReason('');
      setFormError('');
      setPanel({ kind: 'fail', orderId: order.id });
      return;
    }
    updateOrder(order, { status }, 'Status changed', statusMeta[order.status].label, statusMeta[status].label);
    setPanel(null);
  };

  const confirmPayment = (order: OpsOrder, accepted: boolean) => {
    const nextStatus: DeliveryStatus = accepted ? 'ready_for_dispatch' : 'delivery_failed';
    updateOrder(order, {
      status: nextStatus,
      payment_status: accepted ? 'payment_confirmed' : 'payment_failed',
      ...(accepted ? {} : { failureReason: 'Payment could not be verified' }),
    }, accepted ? 'Payment confirmed' : 'Payment rejected', order.payment_status.replace(/_/g, ' '), accepted ? 'payment confirmed' : 'payment failed');
    setPanel(null);
  };

  const saveQuote = () => {
    if (!selectedOrder) return;
    const amount = Number(quoteAmount.replace(/,/g, '').trim());
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Enter a valid amount greater than zero.');
      return;
    }
    updateOrder(selectedOrder, {
      quoted_price: amount,
      price: amount,
      quoted_by: profile?.id || null,
      quoted_at: new Date().toISOString(),
      pricing_status: 'manual_quoted',
      status: 'awaiting_payment',
      payment_status: 'awaiting_payment',
    }, 'Quote saved', selectedOrder.quoted_price == null ? 'No quote' : `₦${selectedOrder.quoted_price.toLocaleString()}`, `₦${amount.toLocaleString()}`);
    setPanel(null);
  };

  const assignRider = (rider: (typeof riders)[number] | null) => {
    if (!selectedOrder) return;
    updateOrder(selectedOrder, {
      rider_id: rider?.id || null,
      rider_name: rider?.name || null,
      rider_phone: rider?.phone || null,
      assigned_at: rider ? new Date().toISOString() : null,
      status: rider ? 'rider_assigned' : 'ready_for_dispatch',
    }, rider ? (selectedOrder.rider_name ? 'Rider reassigned' : 'Rider assigned') : 'Rider unassigned', selectedOrder.rider_name || 'Unassigned', rider?.name || 'Unassigned');
    setPanel(null);
  };

  const saveFailure = () => {
    if (!selectedOrder) return;
    const reason = failureReason.trim();
    if (!reason) {
      setFormError('Add a reason so the team knows what happened.');
      return;
    }
    updateOrder(selectedOrder, { status: 'delivery_failed', failureReason: reason }, 'Delivery failed', statusMeta[selectedOrder.status].label, reason);
    setPanel(null);
  };

  if (!isAuthorized) {
    return (
      <View style={styles.lockedScreen}>
        <View style={styles.lockIcon}><ShieldAlert color={colors.error} size={28} /></View>
        <Text style={styles.lockedTitle}>Operations access required</Text>
        <Text style={styles.lockedCopy}>Only authorized Operations and Admin users can manage Sparrow orders.</Text>
        <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const counts = {
    newOrders: orders.filter((order) => ['payment_submitted', 'pending_manual_quote'].includes(order.status)).length,
    payment: orders.filter((order) => order.payment_status === 'payment_submitted').length,
    dispatch: orders.filter((order) => order.status === 'ready_for_dispatch').length,
    active: orders.filter((order) => ['rider_assigned', 'picked_up', 'in_transit', 'arrived'].includes(order.status)).length,
    exceptions: orders.filter((order) => order.status === 'delivery_failed').length,
  };

  const openPanel = (kind: PanelKind, order: OpsOrder) => {
    setFormError('');
    if (kind === 'quote') setQuoteAmount(order.quoted_price?.toString() || '');
    if (kind === 'fail') setFailureReason(order.failureReason || '');
    setPanel({ kind, orderId: order.id });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Back" onPress={() => router.back()} hitSlop={12}><ArrowLeft color={colors.text} size={22} /></Pressable>
          <View style={styles.headerCopy}><Text style={styles.eyebrow}>SPARROW CONTROL</Text><Text style={styles.title}>Operations</Text></View>
          <View style={styles.adminPill}><UserRound color={colors.primaryDark} size={14} /><Text style={styles.adminPillText}>Admin</Text></View>
        </View>

        <View style={styles.metricsGrid}>
          <Metric label="New orders" value={counts.newOrders} icon={ClipboardList} color={colors.primaryDark} onPress={() => setSelectedFilter('New orders')} />
          <Metric label="Payment review" value={counts.payment} icon={FileText} color={colors.warning} onPress={() => setSelectedFilter('Payment review')} />
          <Metric label="Dispatch queue" value={counts.dispatch} icon={CheckCircle2} color={colors.info} onPress={() => setSelectedFilter('Dispatch queue')} />
          <Metric label="Active deliveries" value={counts.active} icon={MoreHorizontal} color={colors.teal} onPress={() => setSelectedFilter('Active')} />
          <Metric label="Exceptions" value={counts.exceptions} icon={ShieldAlert} color={colors.error} onPress={() => setSelectedFilter('Exceptions')} />
        </View>

        <View style={styles.sectionHeading}>
          <View><Text style={styles.sectionTitle}>Order queue</Text><Text style={styles.sectionCopy}>Review, assign, and update live order workflows.</Text></View>
          <Pressable onPress={() => setPanel({ kind: 'audit' })} style={styles.auditLink}><History color={colors.primaryDark} size={15} /><Text style={styles.link}>Audit log</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filterOptions.map((filter) => (
            <Pressable key={filter} onPress={() => setSelectedFilter(filter)} style={[styles.filter, selectedFilter === filter && styles.filterActive]}>
              <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {filteredOrders.length ? (
          <View style={styles.orderList}>
            {filteredOrders.map((order) => <OrderCard key={order.id} order={order} onOpen={openPanel} />)}
          </View>
        ) : (
          <View style={styles.emptyState}><ClipboardList color={colors.textTertiary} size={26} /><Text style={styles.emptyTitle}>Nothing in this queue</Text><Text style={styles.emptyCopy}>Orders matching this filter will appear here.</Text></View>
        )}
      </ScrollView>

      <Modal visible={!!panel} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPanel(null)}>
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <Pressable accessibilityLabel="Close" onPress={() => setPanel(null)} style={styles.closeButton}><X color={colors.text} size={21} /></Pressable>
            <Text style={styles.modalTitle}>{getPanelTitle(panel?.kind, selectedOrder)}</Text>
            <View style={styles.closeButton} />
          </View>
          {panel?.kind === 'audit' ? (
            <AuditPanel entries={auditEntries} orders={orders} initialOrderId={panel.orderId} />
          ) : selectedOrder ? (
            <ScrollView contentContainerStyle={styles.panelContent} keyboardShouldPersistTaps="handled">
              {panel?.kind === 'details' && <DetailsPanel order={selectedOrder} onAction={openPanel} />}
              {panel?.kind === 'receipt' && <ReceiptPanel order={selectedOrder} onConfirm={() => confirmPayment(selectedOrder, true)} onReject={() => confirmPayment(selectedOrder, false)} />}
              {panel?.kind === 'quote' && <>
                <Text style={styles.fieldLabel}>CUSTOMER</Text><Text style={styles.staticValue}>{selectedOrder.pickup_contact_name} · {selectedOrder.pickup_contact_phone}</Text>
                <Text style={styles.fieldLabel}>ROUTE</Text><Text style={styles.staticValue}>{selectedOrder.pickup_address} → {selectedOrder.destination_address}</Text>
                <Text style={styles.fieldLabel}>QUOTE AMOUNT (₦)</Text>
                <TextInput accessibilityLabel="Quote amount" style={styles.textInput} value={quoteAmount} onChangeText={(value) => { setQuoteAmount(value); setFormError(''); }} keyboardType="numeric" placeholder="e.g. 1500" placeholderTextColor={colors.textTertiary} />
                <Text style={styles.helperText}>Saving a quote sets the order to Awaiting payment.</Text>
                {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
                <ActionButton label="Save quote" onPress={saveQuote} />
              </>}
              {panel?.kind === 'rider' && <>
                <Text style={styles.panelIntro}>Choose a rider to assign or reassign this delivery.</Text>
                {riders.map((rider) => <Pressable key={rider.id} style={styles.riderOption} onPress={() => assignRider(rider)}>
                  <View style={styles.riderAvatar}><Text style={styles.riderAvatarText}>{rider.name.slice(0, 1)}</Text></View>
                  <View style={styles.riderOptionCopy}><Text style={styles.riderName}>{rider.name}</Text><Text style={styles.riderPhone}>{rider.phone} · {rider.status}</Text></View>
                  {selectedOrder.rider_id === rider.id ? <Check color={colors.success} size={19} /> : <ArrowRight color={colors.textTertiary} size={18} />}
                </Pressable>)}
                {selectedOrder.rider_id ? <Pressable style={styles.removeRiderButton} onPress={() => assignRider(null)}><Text style={styles.removeRiderText}>Unassign current rider</Text></Pressable> : null}
              </>}
              {panel?.kind === 'status' && <>
                <Text style={styles.panelIntro}>Select the operational status for {selectedOrder.delivery_code}.</Text>
                <View style={styles.statusOptions}>{statuses.filter((status) => !['draft', 'requested', 'pending_manual_quote'].includes(status)).map((status) => (
                  <Pressable key={status} style={[styles.statusOption, selectedOrder.status === status && styles.statusOptionSelected]} onPress={() => updateStatus(selectedOrder, status)}>
                    <View style={[styles.statusDot, { backgroundColor: statusMeta[status].tone }]} /><Text style={styles.statusOptionText}>{statusMeta[status].label}</Text>{selectedOrder.status === status ? <Check color={colors.success} size={17} /> : null}
                  </Pressable>
                ))}</View>
              </>}
              {panel?.kind === 'fail' && <>
                <View style={styles.notice}><XCircle color={colors.error} size={19} /><Text style={styles.noticeText}>A delivery failure requires a reason and will be recorded in the audit log.</Text></View>
                <Text style={styles.fieldLabel}>FAILURE REASON</Text>
                <TextInput accessibilityLabel="Failure reason" style={[styles.textInput, styles.multilineInput]} value={failureReason} onChangeText={(value) => { setFailureReason(value); setFormError(''); }} multiline placeholder="e.g. Recipient unavailable after multiple calls" placeholderTextColor={colors.textTertiary} textAlignVertical="top" />
                {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
                <ActionButton label="Record failed delivery" onPress={saveFailure} destructive />
              </>}
            </ScrollView>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

function getPanelTitle(kind?: PanelKind, order?: OpsOrder) {
  if (kind === 'audit') return 'Operational audit log';
  const titles: Record<Exclude<PanelKind, 'audit'>, string> = {
    details: 'Order details', receipt: 'Payment receipt', quote: 'Create a quote', rider: 'Assign a rider', status: 'Update status', fail: 'Record exception',
  };
  return `${titles[kind as Exclude<PanelKind, 'audit'>] || 'Order'}${order ? ` · ${order.delivery_code}` : ''}`;
}

function Metric({ label, value, icon: Icon, color, onPress }: { label: string; value: number; icon: typeof ClipboardList; color: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.metric}><Icon color={color} size={18} /><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></Pressable>;
}

function OrderCard({ order, onOpen }: { order: OpsOrder; onOpen: (kind: PanelKind, order: OpsOrder) => void }) {
  const meta = statusMeta[order.status];
  return <View style={styles.orderCard}>
    <View style={styles.orderTop}><View><Text style={styles.orderCode}>{order.delivery_code}</Text><Text style={styles.orderTime}>{formatDate(order.created_at)}</Text></View><View style={[styles.statusPill, { backgroundColor: meta.background }]}><Text style={[styles.statusText, { color: meta.tone }]}>{meta.label}</Text></View></View>
    <View style={styles.route}><Text style={styles.routeLabel}>PICKUP</Text><Text style={styles.routeText}>{order.pickup_address}</Text><Text style={styles.routeLabel}>DROP-OFF</Text><Text style={styles.routeText}>{order.destination_address}</Text></View>
    <View style={styles.orderFooter}><Text style={styles.amount}>{order.quoted_price != null ? `₦${order.quoted_price.toLocaleString()}` : 'Quote needed'}</Text><Text style={styles.customer}>{order.pickup_contact_name} · {order.package_category.replace(/_/g, ' ')}</Text></View>
    <View style={styles.actions}>
      {order.payment_status === 'payment_submitted' ? <Pressable style={styles.primaryAction} onPress={() => onOpen('receipt', order)}><Text style={styles.primaryActionText}>Review receipt</Text></Pressable> : null}
      <Pressable style={styles.outlineAction} onPress={() => onOpen('details', order)}><Text style={styles.outlineActionText}>Details</Text></Pressable>
      <Pressable accessibilityLabel="More order actions" style={styles.iconAction} onPress={() => onOpen('status', order)}><MoreHorizontal color={colors.textSecondary} size={20} /></Pressable>
    </View>
    <View style={styles.quickActions}>
      <QuickAction label={order.quoted_price == null ? 'Create quote' : 'Edit quote'} onPress={() => onOpen('quote', order)} />
      <QuickAction label={order.rider_name ? 'Reassign rider' : 'Assign rider'} onPress={() => onOpen('rider', order)} />
      <QuickAction label="Update status" onPress={() => onOpen('status', order)} />
    </View>
    {order.status === 'delivery_failed' ? <View style={styles.exception}><XCircle color={colors.error} size={16} /><Text style={styles.exceptionText}>{order.failureReason || 'Needs operational review before re-dispatch.'}</Text></View> : null}
  </View>;
}

function QuickAction({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable style={styles.quickAction} onPress={onPress}><Text style={styles.quickActionText}>{label}</Text></Pressable>;
}

function DetailsPanel({ order, onAction }: { order: OpsOrder; onAction: (kind: PanelKind, order: OpsOrder) => void }) {
  return <>
    <View style={styles.detailHero}><View style={[styles.statusPill, { backgroundColor: statusMeta[order.status].background }]}><Text style={[styles.statusText, { color: statusMeta[order.status].tone }]}>{statusMeta[order.status].label}</Text></View><Text style={styles.detailHeroDate}>Created {formatDate(order.created_at)}</Text></View>
    <DetailSection title="Customer"><InfoRow label="Name" value={order.pickup_contact_name} /><InfoRow label="Phone" value={order.pickup_contact_phone} /><InfoRow label="Customer ID" value={order.customer_id} /></DetailSection>
    <DetailSection title="Pickup"><InfoRow label="Address" value={order.pickup_address} /><InfoRow label="Landmark" value={order.pickup_landmark || '—'} /><InfoRow label="Contact" value={`${order.pickup_contact_name} · ${order.pickup_contact_phone}`} /></DetailSection>
    <DetailSection title="Drop-off"><InfoRow label="Address" value={order.destination_address} /><InfoRow label="Landmark" value={order.destination_landmark || '—'} /><InfoRow label="Recipient" value={`${order.destination_contact_name} · ${order.destination_contact_phone}`} /></DetailSection>
    <DetailSection title="Package"><InfoRow label="Type / size" value={`${order.package_category.replace(/_/g, ' ')} · ${order.package_size}`} /><InfoRow label="Description" value={order.package_description || 'No description'} /><InfoRow label="Service" value={order.service_type.replace(/_/g, ' ')} /></DetailSection>
    <DetailSection title="Payment and rider"><InfoRow label="Payment" value={order.payment_status.replace(/_/g, ' ')} /><InfoRow label="Method" value={order.payment_method.replace(/_/g, ' ')} /><InfoRow label="Amount" value={order.quoted_price != null ? `₦${order.quoted_price.toLocaleString()}` : 'Quote pending'} /><InfoRow label="Rider" value={order.rider_name ? `${order.rider_name} · ${order.rider_phone}` : 'Unassigned'} /></DetailSection>
    {order.failureReason ? <View style={styles.notice}><XCircle color={colors.error} size={18} /><Text style={styles.noticeText}>Failure reason: {order.failureReason}</Text></View> : null}
    <View style={styles.panelButtonRow}><ActionButton label="Assign rider" onPress={() => onAction('rider', order)} /><ActionButton label="Audit history" onPress={() => onAction('audit', order)} secondary /></View>
  </>;
}

function ReceiptPanel({ order, onConfirm, onReject }: { order: OpsOrder; onConfirm: () => void; onReject: () => void }) {
  const amount = order.quoted_price ?? order.price ?? 0;
  return <>
    <Text style={styles.panelIntro}>Submitted transfer evidence for {order.delivery_code}. Check the payment details before confirming.</Text>
    <View style={styles.receiptPaper}>
      <View style={styles.receiptBrand}><View style={styles.receiptMark}><Check color={colors.white} size={15} /></View><View><Text style={styles.receiptBrandName}>SPARROW PAYMENTS</Text><Text style={styles.receiptBrandSub}>Transfer receipt · demo evidence</Text></View></View>
      <View style={styles.receiptDivider} />
      <Text style={styles.receiptAmount}>₦{amount.toLocaleString()}</Text><Text style={styles.receiptCaption}>Amount submitted</Text>
      <ReceiptRow label="Payer" value={order.pickup_contact_name} /><ReceiptRow label="Payment method" value="Bank transfer" /><ReceiptRow label="Reference" value={`TRF-${order.delivery_code.replace('SP-', '')}-82941`} /><ReceiptRow label="Order" value={order.delivery_code} /><ReceiptRow label="Submitted" value={formatDate(order.created_at)} />
      <View style={styles.demoNotice}><FileText color={colors.info} size={16} /><Text style={styles.demoNoticeText}>Demo receipt preview. Connect uploaded receipt storage to display the original image.</Text></View>
    </View>
    <View style={styles.panelButtonRow}><ActionButton label="Reject payment" onPress={onReject} destructive /><ActionButton label="Confirm payment" onPress={onConfirm} /></View>
  </>;
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.receiptRow}><Text style={styles.receiptRowLabel}>{label}</Text><Text style={styles.receiptRowValue}>{value}</Text></View>;
}

function AuditPanel({ entries, orders, initialOrderId }: { entries: AuditEntry[]; orders: OpsOrder[]; initialOrderId?: string }) {
  const [orderFilter, setOrderFilter] = useState(initialOrderId || '');
  const visibleEntries = orderFilter ? entries.filter((entry) => entry.orderId === orderFilter) : entries;
  return <View style={styles.auditPanel}>
    <Text style={styles.panelIntro}>Every operational change records its actor, time, and previous value.</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.auditFilters}>
      <Pressable onPress={() => setOrderFilter('')} style={[styles.filter, !orderFilter && styles.filterActive]}><Text style={[styles.filterText, !orderFilter && styles.filterTextActive]}>All orders</Text></Pressable>
      {orders.map((order) => <Pressable key={order.id} onPress={() => setOrderFilter(order.id)} style={[styles.filter, orderFilter === order.id && styles.filterActive]}><Text style={[styles.filterText, orderFilter === order.id && styles.filterTextActive]}>{order.delivery_code}</Text></Pressable>)}
    </ScrollView>
    <ScrollView contentContainerStyle={styles.auditList}>
      {visibleEntries.length ? visibleEntries.map((entry) => <View key={entry.id} style={styles.auditEntry}>
        <View style={styles.auditTimeline}><View style={styles.auditDot} /><View style={styles.auditLine} /></View>
        <View style={styles.auditBody}><View style={styles.auditTop}><Text style={styles.auditAction}>{entry.action}</Text><Text style={styles.auditOrder}>{orders.find((order) => order.id === entry.orderId)?.delivery_code || 'Order'}</Text></View>
          <Text style={styles.auditActor}>{entry.actor} · {formatDate(entry.createdAt)}</Text>
          <Text style={styles.auditChange}><Text style={styles.auditMuted}>Previous: </Text>{entry.previousValue}</Text>
          <Text style={styles.auditChange}><Text style={styles.auditMuted}>New: </Text>{entry.newValue}</Text>
        </View>
      </View>) : <View style={styles.emptyState}><History color={colors.textTertiary} size={25} /><Text style={styles.emptyTitle}>No audit entries yet</Text><Text style={styles.emptyCopy}>Order changes will appear here with the actor and previous value.</Text></View>}
    </ScrollView>
  </View>;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.detailSection}><Text style={styles.detailSectionTitle}>{title}</Text>{children}</View>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

function ActionButton({ label, onPress, secondary = false, destructive = false }: { label: string; onPress: () => void; secondary?: boolean; destructive?: boolean }) {
  return <Pressable style={[styles.panelAction, secondary && styles.panelActionSecondary, destructive && styles.panelActionDestructive]} onPress={onPress}><Text style={[styles.panelActionText, (secondary || destructive) && styles.panelActionAltText]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.lg, paddingTop: 56, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg }, headerCopy: { flex: 1 }, eyebrow: { ...typography.small, color: colors.primaryDark, fontFamily: 'PlusJakartaSans-Bold', letterSpacing: 1 }, title: { ...typography.h1, color: colors.text }, adminPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 7 }, adminPillText: { ...typography.small, color: colors.primaryDark, fontFamily: 'PlusJakartaSans-SemiBold' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl }, metric: { width: '31%', minWidth: 98, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm }, metricValue: { ...typography.h2, color: colors.text, marginTop: spacing.sm }, metricLabel: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.md }, sectionTitle: { ...typography.h2, color: colors.text }, sectionCopy: { ...typography.small, color: colors.textSecondary, marginTop: 3 }, auditLink: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 }, link: { ...typography.captionMedium, color: colors.primaryDark }, filters: { gap: spacing.sm, paddingBottom: spacing.md }, filter: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, filterActive: { backgroundColor: colors.ink, borderColor: colors.ink }, filterText: { ...typography.small, color: colors.textSecondary }, filterTextActive: { color: colors.white, fontFamily: 'PlusJakartaSans-SemiBold' }, orderList: { gap: spacing.md },
  orderCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, ...shadows.sm }, orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, orderCode: { ...typography.h3, color: colors.text }, orderTime: { ...typography.small, color: colors.textTertiary, marginTop: 3 }, statusPill: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 6 }, statusText: { ...typography.small, fontFamily: 'PlusJakartaSans-SemiBold' }, route: { borderLeftWidth: 2, borderLeftColor: colors.primary, paddingLeft: spacing.md, marginVertical: spacing.md, gap: 3 }, routeLabel: { ...typography.small, color: colors.textTertiary, fontFamily: 'PlusJakartaSans-Bold', letterSpacing: 0.6 }, routeText: { ...typography.caption, color: colors.text, marginBottom: 5 }, orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.md }, amount: { ...typography.bodyMedium, color: colors.text }, customer: { ...typography.small, color: colors.textSecondary }, actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }, primaryAction: { flex: 1, backgroundColor: colors.ink, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 11 }, primaryActionText: { ...typography.small, color: colors.white, fontFamily: 'PlusJakartaSans-SemiBold' }, outlineAction: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 }, outlineActionText: { ...typography.small, color: colors.text, fontFamily: 'PlusJakartaSans-SemiBold' }, iconAction: { width: 42, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' }, quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }, quickAction: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 8 }, quickActionText: { ...typography.small, color: colors.textSecondary, fontFamily: 'PlusJakartaSans-SemiBold' }, exception: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: spacing.md, backgroundColor: colors.errorLight, padding: spacing.sm, borderRadius: radius.sm }, exceptionText: { ...typography.small, color: colors.error, flex: 1 },
  emptyState: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, gap: spacing.sm }, emptyTitle: { ...typography.h3, color: colors.text }, emptyCopy: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  modalRoot: { flex: 1, backgroundColor: colors.background }, modalHeader: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }, closeButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }, modalTitle: { ...typography.h3, color: colors.text, flex: 1, textAlign: 'center' }, panelContent: { padding: spacing.lg, paddingBottom: 44 },
  detailHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }, detailHeroDate: { ...typography.small, color: colors.textTertiary }, detailSection: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm }, detailSectionTitle: { ...typography.captionMedium, color: colors.text, marginBottom: spacing.sm }, infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 6 }, infoLabel: { ...typography.small, color: colors.textTertiary, flex: 0.8 }, infoValue: { ...typography.small, color: colors.text, flex: 1.5, textAlign: 'right' }, panelButtonRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }, panelAction: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.ink, paddingHorizontal: spacing.md, paddingVertical: 11 }, panelActionSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, panelActionDestructive: { backgroundColor: colors.errorLight, borderWidth: 1, borderColor: colors.errorLight }, panelActionText: { ...typography.captionMedium, color: colors.white, textAlign: 'center' }, panelActionAltText: { color: colors.error },
  panelIntro: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md }, fieldLabel: { ...typography.small, color: colors.textTertiary, fontFamily: 'PlusJakartaSans-Bold', letterSpacing: 0.6, marginTop: spacing.md, marginBottom: spacing.xs }, staticValue: { ...typography.caption, color: colors.text, marginBottom: spacing.sm }, textInput: { minHeight: 50, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, ...typography.body, color: colors.text }, multilineInput: { minHeight: 120, paddingTop: spacing.md }, helperText: { ...typography.small, color: colors.textSecondary, marginTop: spacing.sm }, errorText: { ...typography.small, color: colors.error, marginTop: spacing.sm },
  riderOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm }, riderAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft }, riderAvatarText: { ...typography.bodyMedium, color: colors.primaryDark }, riderOptionCopy: { flex: 1 }, riderName: { ...typography.captionMedium, color: colors.text }, riderPhone: { ...typography.small, color: colors.textSecondary, marginTop: 2 }, removeRiderButton: { alignItems: 'center', padding: spacing.md }, removeRiderText: { ...typography.captionMedium, color: colors.error }, statusOptions: { gap: spacing.sm }, statusOption: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, statusOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft }, statusDot: { width: 9, height: 9, borderRadius: 5 }, statusOptionText: { ...typography.caption, color: colors.text, flex: 1 }, notice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.errorLight, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md }, noticeText: { ...typography.caption, color: colors.error, flex: 1 },
  receiptPaper: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, ...shadows.sm }, receiptBrand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, receiptMark: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' }, receiptBrandName: { ...typography.small, color: colors.ink, fontFamily: 'PlusJakartaSans-Bold', letterSpacing: 0.7 }, receiptBrandSub: { ...typography.small, color: colors.textTertiary }, receiptDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md, borderStyle: 'dashed' }, receiptAmount: { ...typography.h1, color: colors.text, textAlign: 'center', marginTop: spacing.sm }, receiptCaption: { ...typography.small, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg }, receiptRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.borderLight }, receiptRowLabel: { ...typography.small, color: colors.textTertiary }, receiptRowValue: { ...typography.small, color: colors.text, fontFamily: 'PlusJakartaSans-SemiBold', textAlign: 'right', flex: 1 }, demoNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: spacing.md, padding: spacing.sm, backgroundColor: colors.infoLight, borderRadius: radius.sm }, demoNoticeText: { ...typography.small, color: colors.info, flex: 1 },
  auditPanel: { flex: 1, padding: spacing.md }, auditFilters: { gap: spacing.sm, paddingBottom: spacing.md }, auditList: { paddingBottom: spacing.xl }, auditEntry: { flexDirection: 'row', gap: spacing.md, minHeight: 112 }, auditTimeline: { width: 14, alignItems: 'center' }, auditDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primaryDark, marginTop: 5 }, auditLine: { flex: 1, width: 1, backgroundColor: colors.border }, auditBody: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md }, auditTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }, auditAction: { ...typography.captionMedium, color: colors.text, flex: 1 }, auditOrder: { ...typography.small, color: colors.primaryDark }, auditActor: { ...typography.small, color: colors.textTertiary, marginTop: 4, marginBottom: spacing.sm }, auditChange: { ...typography.small, color: colors.text, marginTop: 3 }, auditMuted: { color: colors.textTertiary },
  lockedScreen: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }, lockIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.errorLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md }, lockedTitle: { ...typography.h2, color: colors.text, textAlign: 'center' }, lockedCopy: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.lg }, secondaryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface }, secondaryButtonText: { ...typography.bodyMedium, color: colors.text },
});
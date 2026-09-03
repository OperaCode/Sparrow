import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useDeliveries } from '@/contexts/DeliveriesContext';
import { colors, spacing, typography, radius, shadows, gradients } from '@/constants/theme';
import { SparrowLogo } from '@/components/SparrowLogo';
import { SparrowIllustration } from '@/components/SparrowIllustration';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/Badge';
import { MapPin, ChevronRight, Search, PackageSearch, Package, ShoppingBag } from 'lucide-react-native';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { deliveries } = useDeliveries();
  const recentDelivery = deliveries[0] ?? null;

  const communityLabel = profile?.community
    ? profile.community.charAt(0).toUpperCase() + profile.community.slice(1)
    : '';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SparrowLogo size={28} color={colors.primary} />
          <Text style={styles.brandName}>Sparrow</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/(tabs)/profile')}>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.greeting}>
        <Text style={styles.welcomeText}>
          Welcome back, {profile?.name?.split(' ')[0]} 👋
        </Text>
        <View style={styles.locationRow}>
          <MapPin color={colors.primary} size={16} strokeWidth={2} />
          <Text style={styles.locationText}>{communityLabel}</Text>
        </View>
      </View>

      <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Local delivery,{'\n'}made simple.</Text>
          <Text style={styles.heroSubtitle}>
            Send anything around your community, quickly and easily.
          </Text>
          <View style={styles.heroIllustration}>
            <SparrowIllustration size={44} animated />
            <View style={styles.heroDashLine} />
            <View style={styles.heroDestDot} />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.85} onPress={() => router.push('/send/pickup')}>
          <View style={[styles.actionIconBadge, { backgroundColor: colors.primarySoft }]}>
            <Package color={colors.primaryDark} size={19} strokeWidth={1.8} />
          </View>
          <Text style={styles.actionTitle}>Send a Package</Text>
          <Text style={styles.actionSubtitle}>Get something delivered</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.85} onPress={() => router.push('/errand/request')}>
          <View style={[styles.actionIconBadge, { backgroundColor: colors.tealLight }]}>
            <ShoppingBag color={colors.teal} size={19} strokeWidth={1.8} />
          </View>
          <Text style={styles.actionTitle}>Request an Errand</Text>
          <Text style={styles.actionSubtitle}>Ask a Sparrow to get it for you</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.trackCard}
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)/deliveries')}
      >
        <View style={styles.trackLeft}>
          <Search color={colors.text} size={20} strokeWidth={2} />
          <Text style={styles.trackText}>Track a Delivery</Text>
        </View>
        <ChevronRight color={colors.textTertiary} size={20} strokeWidth={2} />
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Recent Delivery</Text>

      {recentDelivery ? (
        <TouchableOpacity
          style={styles.recentCard}
          activeOpacity={0.85}
          onPress={() => router.push(`/delivery/${recentDelivery.id}`)}
        >
          <View style={styles.recentHeader}>
            <Text style={styles.recentCode}>{recentDelivery.delivery_code}</Text>
            {recentDelivery.status === 'delivered' ? (
              <Badge label="Delivered ✓" variant="success" />
            ) : (
              <Badge label={recentDelivery.status.replace(/_/g, ' ')} variant="info" />
            )}
          </View>
          <View style={styles.recentRoute}>
            <Text style={styles.recentPlace}>{recentDelivery.pickup_address.split(',')[0]}</Text>
            <Text style={styles.recentArrow}>→</Text>
            <Text style={styles.recentPlace}>{recentDelivery.destination_address.split(',')[0]}</Text>
          </View>
          <Text style={styles.recentPrice}>₦{Number(recentDelivery.price).toLocaleString()}</Text>
        </TouchableOpacity>
      ) : (
        <EmptyState
          icon={<PackageSearch color={colors.primaryDark} size={28} strokeWidth={1.75} />}
          title="Nothing here yet."
          message="Your Sparrow deliveries will appear here."
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  brandName: { ...typography.h3, color: colors.text },
  avatarBtn: {},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.bodyMedium, color: colors.white, fontFamily: 'PlusJakartaSans-Bold' },
  greeting: { marginTop: spacing.xl },
  welcomeText: { ...typography.h2, color: colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  locationText: { ...typography.captionMedium, color: colors.textSecondary },
  heroCard: {
    marginTop: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  heroContent: {},
  heroTitle: { ...typography.h1, color: colors.white, fontSize: 26 },
  heroSubtitle: { ...typography.body, color: colors.white, opacity: 0.9, marginTop: spacing.xs, lineHeight: 22 },
  heroIllustration: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  heroDashLine: { flex: 1, height: 0, borderTopWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.75)' },
  heroDestDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.white },
  actionGrid: { flexDirection: 'row', gap: spacing.sm + 2, marginTop: spacing.lg },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  actionIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm + 2,
  },
  actionTitle: { ...typography.captionMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold', marginBottom: 2 },
  actionSubtitle: { ...typography.small, color: colors.textSecondary, lineHeight: 15 },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  trackLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  trackText: { ...typography.bodyMedium, color: colors.text },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.xl },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  recentCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentCode: { ...typography.captionMedium, color: colors.textSecondary, fontFamily: 'PlusJakartaSans-Bold' },
  recentRoute: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  recentPlace: { ...typography.body, color: colors.text },
  recentArrow: { ...typography.body, color: colors.textTertiary },
  recentPrice: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold', marginTop: spacing.xs },
});

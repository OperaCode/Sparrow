import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, typography, radius, gradients } from '@/constants/theme';
import { ChevronRight, MapPin, Package, Bookmark, Gift, FileText, HelpCircle, LogOut, Pencil } from 'lucide-react-native';
import { Badge } from '@/components/Badge';
import { SparrowLogo } from '@/components/SparrowLogo';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Log out?', 'Are you sure you want to log out of Sparrow?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const showComingSoon = () => Alert.alert('Coming soon', 'This feature is on the way.');

  const communityLabel = profile?.community
    ? profile.community.charAt(0).toUpperCase() + profile.community.slice(1)
    : '';

  const menuItems = [
    { icon: Package, label: 'My Deliveries', onPress: () => router.push('/(tabs)/deliveries'), comingSoon: false },
    { icon: Bookmark, label: 'Saved Locations', onPress: () => router.push('/saved-locations'), comingSoon: false },
    { icon: Gift, label: 'Rewards', onPress: showComingSoon, comingSoon: true },
    { icon: FileText, label: 'Terms & Conditions', onPress: showComingSoon, comingSoon: true },
    { icon: HelpCircle, label: 'Help', onPress: showComingSoon, comingSoon: true },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <SparrowLogo size={18} color={colors.primary} />
          <Text style={styles.brandLabel}>Sparrow</Text>
        </View>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.85} onPress={() => router.push('/profile-edit')} hitSlop={8}>
          <Pencil color={colors.textSecondary} size={16} strokeWidth={2} />
        </TouchableOpacity>
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.name?.charAt(0).toUpperCase() || '?'}</Text>
        </LinearGradient>
        <Text style={styles.name}>{profile?.name || 'Jack Sparrow'}</Text>
        <Text style={styles.phone}>{profile?.phone || ''}</Text>
        <View style={styles.communityRow}>
          <MapPin color={colors.primary} size={14} strokeWidth={2} />
          <Text style={styles.communityText}>{communityLabel}</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
            activeOpacity={0.85}
            onPress={item.onPress}
          >
            <item.icon color={colors.textSecondary} size={20} strokeWidth={2} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.comingSoon && <Badge label="Soon" variant="neutral" style={styles.soonBadge} />}
            <ChevronRight color={colors.textTertiary} size={18} strokeWidth={2} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.85} onPress={handleSignOut}>
        <LogOut color={colors.error} size={20} strokeWidth={2} />
        <Text style={styles.signOutText}>Log out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Sparrow v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  header: { paddingTop: 60, paddingBottom: spacing.lg },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  brandLabel: { ...typography.captionMedium, color: colors.primaryDark },
  title: { ...typography.h1, color: colors.text },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
  },
  editBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 28, fontFamily: 'PlusJakartaSans-Bold', color: colors.white },
  name: { ...typography.h2, color: colors.text },
  phone: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  communityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  communityText: { ...typography.captionMedium, color: colors.textSecondary },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md + 2,
    gap: spacing.md,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuLabel: { ...typography.bodyMedium, color: colors.text, flex: 1 },
  soonBadge: { marginRight: spacing.sm },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.errorLight,
  },
  signOutText: { ...typography.bodyMedium, color: colors.error, fontFamily: 'PlusJakartaSans-SemiBold' },
  version: { ...typography.small, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xl },
});

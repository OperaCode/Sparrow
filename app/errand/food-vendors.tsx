import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/Badge';
import { useErrandCart } from '@/contexts/ErrandCartContext';
import { FOOD_VENDORS } from '@/lib/errandCatalog';

const COMMUNITY_LABEL: Record<string, string> = { igbesa: 'Igbesa', lusada: 'Lusada', ketu: 'Ketu' };

export default function FoodVendorsScreen() {
  const { selectVendor } = useErrandCart();

  const handleSelect = (vendorId: string, vendorName: string) => {
    selectVendor(vendorId, vendorName);
    router.push({ pathname: '/errand/food-menu', params: { vendorId } });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Food" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Choose a vendor</Text>
        <Text style={styles.subtitle}>Selected Sparrow food vendors near you.</Text>

        <View style={styles.list}>
          {FOOD_VENDORS.map((vendor) => (
            <TouchableOpacity
              key={vendor.id}
              activeOpacity={0.85}
              disabled={!vendor.isActive}
              style={[styles.card, !vendor.isActive && styles.cardDisabled]}
              onPress={() => handleSelect(vendor.id, vendor.name)}
            >
              <View style={styles.iconBadge}>
                <Text style={styles.iconEmoji}>🍲</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{vendor.name}</Text>
                <Text style={styles.cardSubtitle}>{vendor.description}</Text>
                <Text style={styles.cardCommunity}>{COMMUNITY_LABEL[vendor.community]}</Text>
              </View>
              {!vendor.isActive && <Badge label="Unavailable" variant="neutral" />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 22 },
  list: { gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cardDisabled: { opacity: 0.55 },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.coralLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 24 },
  cardText: { flex: 1 },
  cardTitle: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold', marginBottom: 2 },
  cardSubtitle: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
  cardCommunity: { ...typography.small, color: colors.textTertiary, marginTop: 4 },
});

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { EmptyState } from '@/components/EmptyState';
import { ArrowLeft, MapPin, Trash2, Plus, Bookmark } from 'lucide-react-native';
import { useAddressBook } from '@/contexts/AddressBookContext';

export default function SavedLocationsScreen() {
  const { savedAddresses, removeSavedAddress } = useAddressBook();

  const handleDelete = (id: string, label: string) => {
    Alert.alert('Remove address?', `"${label}" will be removed from your saved locations.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeSavedAddress(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft color={colors.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Saved Locations</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {savedAddresses.length === 0 ? (
          <EmptyState
            icon={<Bookmark color={colors.primaryDark} size={28} strokeWidth={1.75} />}
            title="No saved locations yet."
            message="Save addresses you use often to fill them in faster next time."
          />
        ) : (
          savedAddresses.map((a) => (
            <View key={a.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.label}>{a.label}</Text>
                <TouchableOpacity onPress={() => handleDelete(a.id, a.label)} hitSlop={8}>
                  <Trash2 color={colors.textTertiary} size={18} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <View style={styles.addressRow}>
                <MapPin color={colors.textSecondary} size={16} strokeWidth={2} />
                <Text style={styles.address}>{a.address}</Text>
              </View>
              {a.landmark ? <Text style={styles.landmark}>{a.landmark}</Text> : null}
              <Text style={styles.contact}>{a.contact_name} · {a.contact_phone}</Text>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={() => router.push('/saved-locations-add')}>
          <Plus color={colors.primaryDark} size={20} strokeWidth={2} />
          <Text style={styles.addText}>Add Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  title: { ...typography.h3, color: colors.text },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  label: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-Bold' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  address: { ...typography.body, color: colors.text, flex: 1 },
  landmark: { ...typography.caption, color: colors.textSecondary, marginLeft: 24, marginTop: 2 },
  contact: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginTop: spacing.sm,
  },
  addText: { ...typography.bodyMedium, color: colors.primaryDark, fontFamily: 'PlusJakartaSans-SemiBold' },
});

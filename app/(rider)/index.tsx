import { View, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/Loading';
import { colors, typography, spacing } from '@/constants/theme';

export default function RiderHome() {
  const { profile, loading } = useAuth();

  if (loading) return <Loading />;

  if (profile?.role !== 'rider') return <Redirect href="/(tabs)" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sparrow Rider</Text>
      <Text style={styles.subtitle}>Your assignments will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
});

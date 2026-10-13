import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { SparrowLogo } from '@/components/SparrowLogo';
import type { Coordinate } from '@/lib/geo';

interface DeliveryMapProps {
  pickup: Coordinate;
  destination: Coordinate;
  progress: number;
  showRider?: boolean;
}

// react-native-maps has no web renderer, so the web build shows a lightweight
// route summary instead of a live map — native (iOS/Android) gets the real map.
export function DeliveryMap({ progress, showRider = false }: DeliveryMapProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <View style={styles.line}>
        {showRider && (
          <View style={[styles.riderBadge, { left: `${progress * 100}%` }]}>
            <SparrowLogo size={14} color={colors.white} />
          </View>
        )}
      </View>
      <View style={[styles.dot, styles.dotDest]} />
      <Text style={styles.hint}>Map view available in the mobile app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.ink, borderWidth: 2, borderColor: colors.white },
  dotDest: { backgroundColor: colors.coral },
  line: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', position: 'relative' },
  riderBadge: {
    position: 'absolute',
    top: -13,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    marginLeft: -14,
  },
  hint: {
    ...typography.small,
    color: 'rgba(255,255,255,0.6)',
    position: 'absolute',
    bottom: spacing.sm,
  },
});

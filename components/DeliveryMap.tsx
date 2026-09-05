import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { colors, radius } from '@/constants/theme';
import { SparrowLogo } from '@/components/SparrowLogo';
import type { Coordinate } from '@/lib/geo';

interface DeliveryMapProps {
  pickup: Coordinate;
  destination: Coordinate;
  progress: number;
  showRider?: boolean;
}

export function DeliveryMap({ pickup, destination, progress, showRider = false }: DeliveryMapProps) {
  const riderPosition: Coordinate = {
    latitude: pickup.latitude + (destination.latitude - pickup.latitude) * progress,
    longitude: pickup.longitude + (destination.longitude - pickup.longitude) * progress,
  };

  const midLatitude = (pickup.latitude + destination.latitude) / 2;
  const midLongitude = (pickup.longitude + destination.longitude) / 2;
  const latitudeDelta = Math.max(Math.abs(pickup.latitude - destination.latitude) * 1.8, 0.03);
  const longitudeDelta = Math.max(Math.abs(pickup.longitude - destination.longitude) * 1.8, 0.03);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{ latitude: midLatitude, longitude: midLongitude, latitudeDelta, longitudeDelta }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        showsCompass={false}
      >
        <Polyline
          coordinates={[pickup, destination]}
          strokeColor={colors.primaryDark}
          strokeWidth={3}
          lineDashPattern={[10, 8]}
        />
        <Marker coordinate={pickup} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.pin, { backgroundColor: colors.ink }]} />
        </Marker>
        <Marker coordinate={destination} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.pin, { backgroundColor: colors.coral }]} />
        </Marker>
        {showRider && (
          <Marker coordinate={riderPosition} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.riderBadge}>
              <SparrowLogo size={16} color={colors.white} />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  map: { flex: 1 },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.white,
  },
  riderBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
});

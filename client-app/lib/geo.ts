import type { Community } from '@/types';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

// Approximate real-world coordinates for each community.
export const COMMUNITY_COORDS: Record<Community, Coordinate> = {
  igbesa: { latitude: 6.45, longitude: 2.8667 },
  lusada: { latitude: 6.4333, longitude: 2.8333 },
  ketu: { latitude: 6.595, longitude: 3.39 },
};

// Deterministic small offset so two addresses in the same community
// don't land on the exact same map coordinate.
export function jitterCoordinate(coord: Coordinate, seed: string): Coordinate {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 10000;
  }
  const offset = ((hash / 10000) - 0.5) * 0.012;
  return {
    latitude: coord.latitude + offset,
    longitude: coord.longitude - offset,
  };
}

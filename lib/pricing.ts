import type { Community, ErrandTier, SpecialPickupTier, ZoneTier } from '@/types';

/**
 * Single source of truth for Sparrow's zone/task pricing, matching the approved
 * Business Foundation & Operating Plan V1.0 (§4). The DB seed in
 * supabase/migrations must mirror these numbers exactly.
 */
export const ZONE_TIER_PRICE: Record<'A' | 'B' | 'C', number> = {
  A: 800,
  B: 1000,
  C: 1300,
};

export const SPECIAL_PICKUP_FEE: Partial<Record<SpecialPickupTier, number>> = {
  local: 500,
  nearby: 700,
  // extended is manual-quote — deliberately absent
};

export const ERRAND_FEE: Partial<Record<ErrandTier, number>> = {
  simple: 500,
  moderate: 700,
  // complex is manual-quote — deliberately absent
};

/** A zone selection that can resolve to a community, or an explicit "outside these areas" choice. */
export type ZoneSelection = Community | 'unsure' | null;

function resolveCommunity(selection: ZoneSelection): Community | null {
  return selection === 'unsure' || selection === null ? null : selection;
}

/**
 * Classifies a pickup/destination community pair into a Zone A/B/C tier.
 * Same community -> A. Igbesa<->Lusada -> B. Anything touching Ketu -> C.
 */
export function classifyZoneTier(a: Community, b: Community): 'A' | 'B' | 'C' {
  if (a === b) return 'A';
  if (a === 'ketu' || b === 'ketu') return 'C';
  return 'B';
}

export interface ZonePriceResult {
  tier: ZoneTier;
  price: number | null;
}

/** Standard Delivery zone pricing. Either side unresolved ("unsure"/unset) -> Pending Manual Quote. */
export function getZonePrice(pickup: ZoneSelection, destination: ZoneSelection): ZonePriceResult {
  const pickupCommunity = resolveCommunity(pickup);
  const destinationCommunity = resolveCommunity(destination);

  if (!pickupCommunity || !destinationCommunity) {
    return { tier: 'outside_area', price: null };
  }

  const tier = classifyZoneTier(pickupCommunity, destinationCommunity);
  return { tier, price: ZONE_TIER_PRICE[tier] };
}

export interface SpecialPickupResult {
  tier: SpecialPickupTier | 'outside_area';
  fee: number | null;
}

/**
 * Special Pickup fee — reuses the same zone classification, mapping A/B/C onto
 * Local/Nearby/Extended, per the Business Foundation §4.1.
 */
export function getSpecialPickupFee(homeZone: ZoneSelection, collectionZone: ZoneSelection): SpecialPickupResult {
  const home = resolveCommunity(homeZone);
  const collection = resolveCommunity(collectionZone);

  if (!home || !collection) {
    return { tier: 'outside_area', fee: null };
  }

  const zoneTier = classifyZoneTier(home, collection);
  const tier: SpecialPickupTier = zoneTier === 'A' ? 'local' : zoneTier === 'B' ? 'nearby' : 'extended';
  return { tier, fee: SPECIAL_PICKUP_FEE[tier] ?? null };
}

/** Errand service fee for a chosen tier. Complex tier is manual-quote. */
export function getErrandFee(tier: ErrandTier | null): number | null {
  if (!tier) return null;
  return ERRAND_FEE[tier] ?? null;
}

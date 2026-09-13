import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Community, Delivery } from '@/types';
import type { DeliveryDraft } from '@/contexts/DraftContext';
import { mockDeliveries } from '@/lib/mockData';
import { COMMUNITY_COORDS, jitterCoordinate } from '@/lib/geo';

function nextDeliveryCode(deliveries: Delivery[]): string {
  const max = deliveries.reduce((m, d) => {
    const n = parseInt(d.delivery_code.replace('SP-', ''), 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 1000);
  return `SP-${max + 1}`;
}

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Opaque random token, not the raw delivery id — mirrors the DB's
 * generate_qr_token() so the app and Phase 1 backend behave identically
 * once this is wired to Supabase (PRD §15 anti-enumeration requirement).
 */
function generateQrToken(): string {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

interface DeliveriesContextValue {
  deliveries: Delivery[];
  addDelivery: (draft: DeliveryDraft, customerId: string) => Delivery;
  getDeliveryById: (id: string) => Delivery | null;
  rateDelivery: (id: string, rating: number, comment: string) => void;
  cancelDelivery: (id: string) => void;
}

const DeliveriesContext = createContext<DeliveriesContextValue>({
  deliveries: [],
  addDelivery: () => {
    throw new Error('useDeliveries must be used within a DeliveriesProvider');
  },
  getDeliveryById: () => null,
  rateDelivery: () => {},
  cancelDelivery: () => {},
});

export function DeliveriesProvider({ children }: { children: ReactNode }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);

  const addDelivery = (draft: DeliveryDraft, customerId: string): Delivery => {
    const pickupCommunity: Community =
      (draft.pickupZone && draft.pickupZone !== 'unsure' ? draft.pickupZone : null) || 'igbesa';
    const destinationCommunity: Community =
      (draft.destinationZone && draft.destinationZone !== 'unsure' ? draft.destinationZone : null) || pickupCommunity;
    const pickupCoord = jitterCoordinate(COMMUNITY_COORDS[pickupCommunity], draft.pickupAddress || 'pickup');
    const destinationCoord = jitterCoordinate(COMMUNITY_COORDS[destinationCommunity], draft.destinationAddress || 'destination');

    const isPendingQuote = draft.pricingStatus === 'pending_manual_quote';

    const delivery: Delivery = {
      id: `delivery-${Date.now()}`,
      delivery_code: nextDeliveryCode(deliveries),
      customer_id: customerId,
      rider_id: null,
      rider_name: null,
      rider_phone: null,
      pickup_address: draft.pickupAddress,
      pickup_landmark: draft.pickupLandmark || null,
      pickup_contact_name: draft.pickupContactName,
      pickup_contact_phone: draft.pickupContactPhone,
      pickup_latitude: draft.pickupLatitude ?? pickupCoord.latitude,
      pickup_longitude: draft.pickupLongitude ?? pickupCoord.longitude,
      destination_address: draft.destinationAddress,
      destination_landmark: draft.destinationLandmark || null,
      destination_contact_name: draft.destinationContactName,
      destination_contact_phone: draft.destinationContactPhone,
      destination_latitude: draft.destinationLatitude ?? destinationCoord.latitude,
      destination_longitude: draft.destinationLongitude ?? destinationCoord.longitude,
      package_category: draft.packageCategory ?? 'other',
      package_description: draft.packageDescription || null,
      package_size: draft.packageSize ?? 'small',
      package_photo_url: draft.packagePhotoUrl,
      service_type: draft.serviceType,
      zone_tier: draft.zoneTier,
      pricing_status: draft.pricingStatus,
      quoted_price: null,
      quoted_by: null,
      quoted_at: null,
      special_pickup_tier: draft.specialPickupTier,
      special_pickup_fee: draft.specialPickupFee,
      errand_category: draft.errandCategory,
      errand_tier: draft.errandTier,
      errand_fee: draft.errandFee,
      estimated_item_cost: draft.estimatedItemCost,
      actual_item_cost: null,
      price: isPendingQuote ? null : draft.price ?? 0,
      payment_method: 'bank_transfer',
      payment_status: isPendingQuote ? 'awaiting_payment' : 'payment_submitted',
      delivery_pin: generatePin(),
      delivery_pin_verified: false,
      qr_token: generateQrToken(),
      completed_via: null,
      pin_attempt_count: 0,
      pin_locked_at: null,
      pickup_photo_url: null,
      delivery_photo_url: null,
      status: isPendingQuote ? 'pending_manual_quote' : 'payment_submitted',
      rating: null,
      rating_comment: null,
      created_at: new Date().toISOString(),
      assigned_at: null,
      picked_up_at: null,
      delivered_at: null,
    };

    setDeliveries((prev) => [delivery, ...prev]);
    return delivery;
  };

  const getDeliveryById = (id: string) => deliveries.find((d) => d.id === id) ?? null;

  const rateDelivery = (id: string, rating: number, comment: string) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, rating, rating_comment: comment || null } : d)),
    );
  };

  const cancelDelivery = (id: string) => {
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'cancelled' } : d)));
  };

  return (
    <DeliveriesContext.Provider value={{ deliveries, addDelivery, getDeliveryById, rateDelivery, cancelDelivery }}>
      {children}
    </DeliveriesContext.Provider>
  );
}

export function useDeliveries() {
  return useContext(DeliveriesContext);
}

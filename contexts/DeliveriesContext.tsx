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
    const pickupZone = (draft.pickupZone as Community) || 'igbesa';
    const destinationZone = (draft.destinationZone as Community) || pickupZone;
    const pickupCoord = jitterCoordinate(COMMUNITY_COORDS[pickupZone], draft.pickupAddress || 'pickup');
    const destinationCoord = jitterCoordinate(COMMUNITY_COORDS[destinationZone], draft.destinationAddress || 'destination');

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
      price: draft.price ?? 0,
      payment_method: 'bank_transfer',
      payment_status: 'payment_submitted',
      delivery_pin: generatePin(),
      delivery_pin_verified: false,
      pickup_photo_url: null,
      delivery_photo_url: null,
      status: 'payment_submitted',
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

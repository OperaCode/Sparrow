import type { Delivery, SavedAddress, UserProfile } from '@/types';
import { COMMUNITY_COORDS, jitterCoordinate } from '@/lib/geo';

export const mockProfile: UserProfile = {
  id: 'mock-user-id',
  phone: '+234 801 234 5678',
  name: 'Raphael',
  community: 'igbesa',
  role: 'customer',
  account_type: 'standard',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockDeliveries: Delivery[] = [
  {
    id: 'mock-delivery-1',
    delivery_code: 'SP-1042',
    customer_id: 'mock-user-id',
    rider_id: 'mock-rider-1',
    rider_name: 'Tunde Bakare',
    rider_phone: '080 222 3344',
    pickup_address: 'Lusada Market, Lusada',
    pickup_landmark: 'Opposite First Bank',
    pickup_contact_name: 'Raphael',
    pickup_contact_phone: '080 123 4567',
    pickup_latitude: jitterCoordinate(COMMUNITY_COORDS.lusada, 'lusada-market').latitude,
    pickup_longitude: jitterCoordinate(COMMUNITY_COORDS.lusada, 'lusada-market').longitude,
    destination_address: 'Igbesa Junction, Igbesa',
    destination_landmark: 'Near the filling station',
    destination_contact_name: 'John',
    destination_contact_phone: '080 987 6543',
    destination_latitude: jitterCoordinate(COMMUNITY_COORDS.igbesa, 'igbesa-junction').latitude,
    destination_longitude: jitterCoordinate(COMMUNITY_COORDS.igbesa, 'igbesa-junction').longitude,
    package_category: 'clothing',
    package_description: 'Blue envelope with documents',
    package_size: 'small',
    package_photo_url: null,
    price: 1200,
    payment_method: 'bank_transfer',
    payment_status: 'payment_confirmed',
    delivery_pin: '4821',
    delivery_pin_verified: false,
    pickup_photo_url: null,
    delivery_photo_url: null,
    status: 'in_transit',
    rating: null,
    rating_comment: null,
    created_at: '2026-09-01T10:30:00Z',
    assigned_at: '2026-09-01T11:00:00Z',
    picked_up_at: '2026-09-01T11:15:00Z',
    delivered_at: null,
  },
  {
    id: 'mock-delivery-2',
    delivery_code: 'SP-1039',
    customer_id: 'mock-user-id',
    rider_id: 'mock-rider-2',
    rider_name: 'Chidi Okonkwo',
    rider_phone: '080 444 5566',
    pickup_address: 'Igbesa Junction, Igbesa',
    pickup_landmark: null,
    pickup_contact_name: 'Raphael',
    pickup_contact_phone: '080 123 4567',
    pickup_latitude: jitterCoordinate(COMMUNITY_COORDS.igbesa, 'igbesa-junction-2').latitude,
    pickup_longitude: jitterCoordinate(COMMUNITY_COORDS.igbesa, 'igbesa-junction-2').longitude,
    destination_address: 'Ketu Market, Ketu',
    destination_landmark: 'By the roundabout',
    destination_contact_name: 'Ada',
    destination_contact_phone: '080 555 0000',
    destination_latitude: jitterCoordinate(COMMUNITY_COORDS.ketu, 'ketu-market').latitude,
    destination_longitude: jitterCoordinate(COMMUNITY_COORDS.ketu, 'ketu-market').longitude,
    package_category: 'food',
    package_description: 'Lunch box',
    package_size: 'medium',
    package_photo_url: null,
    price: 1500,
    payment_method: 'bank_transfer',
    payment_status: 'payment_confirmed',
    delivery_pin: '1937',
    delivery_pin_verified: true,
    pickup_photo_url: null,
    delivery_photo_url: null,
    status: 'delivered',
    rating: 5,
    rating_comment: 'Fast and friendly!',
    created_at: '2026-08-28T14:00:00Z',
    assigned_at: '2026-08-28T14:30:00Z',
    picked_up_at: '2026-08-28T14:45:00Z',
    delivered_at: '2026-08-28T15:20:00Z',
  },
];

export const mockSavedAddresses: SavedAddress[] = [
  {
    id: 'saved-home',
    label: 'Home',
    address: 'Igbesa Junction, Igbesa',
    landmark: 'Near the filling station',
    contact_name: 'Raphael',
    contact_phone: '080 123 4567',
    zone: 'igbesa',
  },
];

export const mockPricing: Record<string, number> = {
  'igbesa-igbesa': 800,
  'igbesa-lusada': 1200,
  'igbesa-ketu': 1500,
  'lusada-igbesa': 1200,
  'lusada-lusada': 800,
  'lusada-ketu': 1500,
  'ketu-igbesa': 1500,
  'ketu-lusada': 1500,
  'ketu-ketu': 800,
};

export function getMockPrice(pickupZone: string, destZone: string): number {
  return mockPricing[`${pickupZone}-${destZone}`] ?? 800;
}

export function getMockDeliveryById(id: string): Delivery | null {
  return mockDeliveries.find((d) => d.id === id) ?? null;
}

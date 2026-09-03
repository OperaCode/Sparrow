export type Community = 'igbesa' | 'lusada' | 'ketu';

export type UserRole = 'customer' | 'rider' | 'admin';

export type AccountType = 'standard' | 'business';

export type DeliveryStatus =
  | 'draft'
  | 'requested'
  | 'awaiting_payment'
  | 'payment_submitted'
  | 'payment_confirmed'
  | 'ready_for_dispatch'
  | 'rider_assigned'
  | 'picked_up'
  | 'in_transit'
  | 'arrived'
  | 'pin_verified'
  | 'delivered'
  | 'cancelled'
  | 'delivery_failed';

export type PaymentStatus =
  | 'awaiting_payment'
  | 'payment_submitted'
  | 'payment_confirmed'
  | 'payment_failed';

export type PackageCategory =
  | 'document'
  | 'food'
  | 'clothing'
  | 'gift'
  | 'spare_part'
  | 'other';

export type PackageSize = 'small' | 'medium' | 'large';

export interface UserProfile {
  id: string;
  phone: string;
  name: string | null;
  community: Community | null;
  role: UserRole;
  account_type: AccountType;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  delivery_code: string;
  customer_id: string;
  rider_id: string | null;
  pickup_address: string;
  pickup_landmark: string | null;
  pickup_contact_name: string;
  pickup_contact_phone: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  destination_address: string;
  destination_landmark: string | null;
  destination_contact_name: string;
  destination_contact_phone: string;
  destination_latitude: number | null;
  destination_longitude: number | null;
  package_category: PackageCategory;
  package_description: string | null;
  package_size: PackageSize;
  package_photo_url: string | null;
  price: number;
  payment_method: string;
  payment_status: PaymentStatus;
  delivery_pin: string;
  delivery_pin_verified: boolean;
  pickup_photo_url: string | null;
  delivery_photo_url: string | null;
  status: DeliveryStatus;
  created_at: string;
  assigned_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
}

export interface Pricing {
  id: string;
  pickup_zone: Community;
  destination_zone: Community;
  price: number;
  is_active: boolean;
}

export interface Rider {
  id: string;
  user_id: string;
  rider_code: string | null;
  status: 'active' | 'inactive' | 'on_errand';
  bicycle_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  delivery_id: string | null;
  is_read: boolean;
  created_at: string;
}

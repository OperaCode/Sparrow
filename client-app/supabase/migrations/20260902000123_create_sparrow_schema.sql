/*
# Sparrow — Core Database Schema

## Overview
Creates the foundational database tables for Sparrow, a hyperlocal delivery platform.
This migration establishes users, deliveries, riders, bicycles, payments, ratings,
pricing, and notifications tables with proper Row Level Security.

## New Tables

1. **users** — Extends auth.users with Sparrow profile data (name, phone, community, role, account type)
2. **deliveries** — Core delivery records with pickup/destination/package details, status, PIN
3. **riders** — Rider profiles linked to users
4. **bicycles** — Fleet management for company bicycles
5. **payments** — Payment records for deliveries
6. **ratings** — Customer ratings for completed deliveries
7. **pricing** — Zone-based configurable pricing for delivery routes
8. **notifications** — Notification log for customer and rider alerts

## Security
- RLS enabled on all tables
- Users can only access their own data
- Riders can only access deliveries assigned to them
- All critical state changes (payment confirmation, rider assignment, PIN verification, delivery completion) 
  are protected via SECURITY DEFINER functions (added in subsequent migrations)
- Admin access handled via service role key (bypasses RLS)
*/

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text NOT NULL,
  name text,
  community text CHECK (community IN ('igbesa', 'lusada', 'ketu')),
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'rider', 'admin')),
  account_type text NOT NULL DEFAULT 'standard' CHECK (account_type IN ('standard', 'business')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================
-- RIDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS riders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rider_code text UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_errand')),
  bicycle_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE riders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "riders_select_own" ON riders;
CREATE POLICY "riders_select_own" ON riders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "riders_insert_own" ON riders;
CREATE POLICY "riders_insert_own" ON riders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "riders_update_own" ON riders;
CREATE POLICY "riders_update_own" ON riders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- BICYCLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bicycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'retired')),
  condition text NOT NULL DEFAULT 'good' CHECK (condition IN ('good', 'fair', 'needs_repair', 'retired')),
  assigned_rider_id uuid REFERENCES riders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bicycles ENABLE ROW LEVEL SECURITY;

-- Bicycles are admin-managed; riders can read their assigned bicycle
DROP POLICY IF EXISTS "bicycles_select_own" ON bicycles;
CREATE POLICY "bicycles_select_own" ON bicycles FOR SELECT
  TO authenticated USING (
    assigned_rider_id IN (SELECT id FROM riders WHERE user_id = auth.uid())
  );

-- ============================================
-- DELIVERIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_code text UNIQUE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rider_id uuid REFERENCES riders(id) ON DELETE SET NULL,

  pickup_address text NOT NULL,
  pickup_landmark text,
  pickup_contact_name text NOT NULL,
  pickup_contact_phone text NOT NULL,
  pickup_latitude double precision,
  pickup_longitude double precision,

  destination_address text NOT NULL,
  destination_landmark text,
  destination_contact_name text NOT NULL,
  destination_contact_phone text NOT NULL,
  destination_latitude double precision,
  destination_longitude double precision,

  package_category text NOT NULL CHECK (package_category IN ('document', 'food', 'clothing', 'gift', 'spare_part', 'other')),
  package_description text,
  package_size text NOT NULL CHECK (package_size IN ('small', 'medium', 'large')),
  package_photo_url text,

  price numeric(10, 2) NOT NULL,
  payment_method text NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer')),
  payment_status text NOT NULL DEFAULT 'awaiting_payment' CHECK (payment_status IN ('awaiting_payment', 'payment_submitted', 'payment_confirmed', 'payment_failed')),

  delivery_pin text NOT NULL,
  delivery_pin_verified boolean NOT NULL DEFAULT false,

  pickup_photo_url text,
  delivery_photo_url text,

  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'requested', 'awaiting_payment', 'payment_submitted', 'payment_confirmed',
    'ready_for_dispatch', 'rider_assigned', 'picked_up', 'in_transit', 'arrived',
    'pin_verified', 'delivered', 'cancelled', 'delivery_failed'
  )),

  created_at timestamptz NOT NULL DEFAULT now(),
  assigned_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz
);

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Customers can see their own deliveries
DROP POLICY IF EXISTS "deliveries_select_customer" ON deliveries;
CREATE POLICY "deliveries_select_customer" ON deliveries FOR SELECT
  TO authenticated USING (auth.uid() = customer_id);

-- Customers can create deliveries for themselves
DROP POLICY IF EXISTS "deliveries_insert_customer" ON deliveries;
CREATE POLICY "deliveries_insert_customer" ON deliveries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

-- Riders can see deliveries assigned to them
DROP POLICY IF EXISTS "deliveries_select_rider" ON deliveries;
CREATE POLICY "deliveries_select_rider" ON deliveries FOR SELECT
  TO authenticated USING (
    rider_id IN (SELECT id FROM riders WHERE user_id = auth.uid())
  );

-- Riders can update status fields for deliveries assigned to them
DROP POLICY IF EXISTS "deliveries_update_rider" ON deliveries;
CREATE POLICY "deliveries_update_rider" ON deliveries FOR UPDATE
  TO authenticated USING (
    rider_id IN (SELECT id FROM riders WHERE user_id = auth.uid())
  ) WITH CHECK (
    rider_id IN (SELECT id FROM riders WHERE user_id = auth.uid())
  );

-- Customers can update their own deliveries (e.g., upload receipt, cancel)
DROP POLICY IF EXISTS "deliveries_update_customer" ON deliveries;
CREATE POLICY "deliveries_update_customer" ON deliveries FOR UPDATE
  TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  method text NOT NULL DEFAULT 'bank_transfer' CHECK (method IN ('bank_transfer')),
  status text NOT NULL DEFAULT 'awaiting_payment' CHECK (status IN ('awaiting_payment', 'payment_submitted', 'payment_confirmed', 'payment_failed')),
  receipt_url text,
  verified_by uuid REFERENCES users(id),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Customers can see their own payments
DROP POLICY IF EXISTS "payments_select_customer" ON payments;
CREATE POLICY "payments_select_customer" ON payments FOR SELECT
  TO authenticated USING (auth.uid() = customer_id);

-- Customers can create their own payment records
DROP POLICY IF EXISTS "payments_insert_customer" ON payments;
CREATE POLICY "payments_insert_customer" ON payments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

-- Customers can update their own payments (e.g., upload receipt)
DROP POLICY IF EXISTS "payments_update_customer" ON payments;
CREATE POLICY "payments_update_customer" ON payments FOR UPDATE
  TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- ============================================
-- RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ratings_select_own" ON ratings;
CREATE POLICY "ratings_select_own" ON ratings FOR SELECT
  TO authenticated USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "ratings_insert_own" ON ratings;
CREATE POLICY "ratings_insert_own" ON ratings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "ratings_update_own" ON ratings;
CREATE POLICY "ratings_update_own" ON ratings FOR UPDATE
  TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- ============================================
-- PRICING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_zone text NOT NULL CHECK (pickup_zone IN ('igbesa', 'lusada', 'ketu')),
  destination_zone text NOT NULL CHECK (destination_zone IN ('igbesa', 'lusada', 'ketu')),
  price numeric(10, 2) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pickup_zone, destination_zone)
);

ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- Pricing is readable by all authenticated users (customers need to see prices)
DROP POLICY IF EXISTS "pricing_select_all" ON pricing;
CREATE POLICY "pricing_select_all" ON pricing FOR SELECT
  TO authenticated USING (is_active = true);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL CHECK (type IN (
    'payment_submitted', 'payment_confirmed', 'rider_assigned',
    'picked_up', 'in_transit', 'delivered', 'new_assignment',
    'assignment_changed', 'delivery_cancelled'
  )),
  delivery_id uuid REFERENCES deliveries(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_deliveries_customer_id ON deliveries(customer_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_rider_id ON deliveries(rider_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_payments_delivery_id ON payments(delivery_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_delivery_id ON ratings(delivery_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_riders_user_id ON riders(user_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_riders_updated_at ON riders;
CREATE TRIGGER trigger_riders_updated_at BEFORE UPDATE ON riders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_bicycles_updated_at ON bicycles;
CREATE TRIGGER trigger_bicycles_updated_at BEFORE UPDATE ON bicycles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_pricing_updated_at ON pricing;
CREATE TRIGGER trigger_pricing_updated_at BEFORE UPDATE ON pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED PRICING DATA
-- ============================================
INSERT INTO pricing (pickup_zone, destination_zone, price) VALUES
  ('igbesa', 'igbesa', 800),
  ('igbesa', 'lusada', 1200),
  ('igbesa', 'ketu', 1500),
  ('lusada', 'igbesa', 1200),
  ('lusada', 'lusada', 800),
  ('lusada', 'ketu', 1500),
  ('ketu', 'igbesa', 1500),
  ('ketu', 'lusada', 1500),
  ('ketu', 'ketu', 800)
ON CONFLICT (pickup_zone, destination_zone) DO NOTHING;

-- ============================================
-- DELIVERY CODE GENERATION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION generate_delivery_code()
RETURNS text AS $$
DECLARE
  next_num integer;
  new_code text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(delivery_code FROM 4) AS integer)), 1000) + 1
  INTO next_num
  FROM deliveries
  WHERE delivery_code LIKE 'SP-%';

  new_code := 'SP-' || next_num;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DELIVERY PIN GENERATION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION generate_delivery_pin()
RETURNS text AS $$
DECLARE
  pin text;
  exists boolean;
BEGIN
  LOOP
    pin := lpad(CAST(floor(random() * 10000) AS integer)::text, 4, '0');
    SELECT EXISTS(SELECT 1 FROM deliveries WHERE delivery_pin = pin AND status != 'delivered' AND status != 'cancelled') INTO exists;
    IF NOT exists THEN
      RETURN pin;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
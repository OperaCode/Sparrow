/*
# Sparrow — Phase 0: Pricing Reconciliation, Service Types, QR/PIN Rebuild

## Overview
Reconciles the `pricing` seed with the approved Business Foundation & Operating
Plan V1.0 zone matrix (Zone A ₦800 / Zone B ₦1,000 / Zone C ₦1,300), and adds the
columns required to represent Special Pickup, Errand, the Pending Manual Quote
pricing path, and the recipient-scan QR/PIN completion flow described in the PRD.

No RPCs or storage buckets are added here — those are Phase 1-3 work once
Supabase is actually wired into the app. This migration only prepares the shape
so that work doesn't require a second schema change.

## Changes
1. Corrects `pricing` seed values (was 800/1200/1500, now 800/1000/1300).
2. Adds `special_pickup_pricing` and `errand_pricing` config tables, mirroring
   the existing `pricing` table shape.
3. Adds `service_type`, `zone_tier`, `pricing_status`, `quoted_price`,
   `quoted_by`, `quoted_at` to `deliveries` for the manual-quote path.
4. Adds `special_pickup_tier`, `special_pickup_fee` and `errand_category`,
   `errand_tier`, `errand_fee`, `estimated_item_cost`, `actual_item_cost`.
5. Adds `qr_token`, `completed_via`, `pin_attempt_count`, `pin_locked_at` for
   the recipient QR-scan PIN verification flow (PRD §11.7).
6. Makes `price` nullable — a Pending Manual Quote order has no price yet.
7. Adds `'pending_manual_quote'` to the `deliveries.status` check constraint.
8. Adds `generate_qr_token()`, mirroring the existing `generate_delivery_pin()`
   pattern — an opaque random token, never the raw delivery id (PRD §15).
*/

-- ============================================
-- 1. FIX PRICING SEED VALUES
-- ============================================
UPDATE pricing SET price = 1000 WHERE pickup_zone = 'igbesa' AND destination_zone = 'lusada';
UPDATE pricing SET price = 1000 WHERE pickup_zone = 'lusada' AND destination_zone = 'igbesa';
UPDATE pricing SET price = 1300 WHERE pickup_zone = 'igbesa' AND destination_zone = 'ketu';
UPDATE pricing SET price = 1300 WHERE pickup_zone = 'ketu' AND destination_zone = 'igbesa';
UPDATE pricing SET price = 1300 WHERE pickup_zone = 'lusada' AND destination_zone = 'ketu';
UPDATE pricing SET price = 1300 WHERE pickup_zone = 'ketu' AND destination_zone = 'lusada';
-- same-community rows (igbesa-igbesa, lusada-lusada, ketu-ketu) were already 800.

-- ============================================
-- 2. SPECIAL PICKUP & ERRAND PRICING TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS special_pickup_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier text NOT NULL UNIQUE CHECK (tier IN ('local', 'nearby', 'extended')),
  fee numeric(10, 2), -- null = manual quote (extended)
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE special_pickup_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "special_pickup_pricing_select_all" ON special_pickup_pricing;
CREATE POLICY "special_pickup_pricing_select_all" ON special_pickup_pricing FOR SELECT
  TO authenticated USING (is_active = true);

DROP TRIGGER IF EXISTS trigger_special_pickup_pricing_updated_at ON special_pickup_pricing;
CREATE TRIGGER trigger_special_pickup_pricing_updated_at BEFORE UPDATE ON special_pickup_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO special_pickup_pricing (tier, fee) VALUES
  ('local', 500),
  ('nearby', 700),
  ('extended', NULL)
ON CONFLICT (tier) DO NOTHING;

CREATE TABLE IF NOT EXISTS errand_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier text NOT NULL UNIQUE CHECK (tier IN ('simple', 'moderate', 'complex')),
  fee numeric(10, 2), -- null = manual quote (complex)
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE errand_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "errand_pricing_select_all" ON errand_pricing;
CREATE POLICY "errand_pricing_select_all" ON errand_pricing FOR SELECT
  TO authenticated USING (is_active = true);

DROP TRIGGER IF EXISTS trigger_errand_pricing_updated_at ON errand_pricing;
CREATE TRIGGER trigger_errand_pricing_updated_at BEFORE UPDATE ON errand_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO errand_pricing (tier, fee) VALUES
  ('simple', 500),
  ('moderate', 700),
  ('complex', NULL)
ON CONFLICT (tier) DO NOTHING;

-- ============================================
-- 3. DELIVERIES — SERVICE TYPE & MANUAL QUOTE PATH
-- ============================================
ALTER TABLE deliveries ALTER COLUMN price DROP NOT NULL;

ALTER TABLE deliveries
  ADD COLUMN IF NOT EXISTS service_type text NOT NULL DEFAULT 'standard'
    CHECK (service_type IN ('standard', 'special_pickup', 'errand')),
  ADD COLUMN IF NOT EXISTS zone_tier text
    CHECK (zone_tier IN ('A', 'B', 'C', 'extended', 'outside_area')),
  ADD COLUMN IF NOT EXISTS pricing_status text NOT NULL DEFAULT 'auto'
    CHECK (pricing_status IN ('auto', 'pending_manual_quote', 'manual_quoted')),
  ADD COLUMN IF NOT EXISTS quoted_price numeric(10, 2),
  ADD COLUMN IF NOT EXISTS quoted_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS quoted_at timestamptz;

-- ============================================
-- 4. SPECIAL PICKUP & ERRAND FIELDS
-- ============================================
ALTER TABLE deliveries
  ADD COLUMN IF NOT EXISTS special_pickup_tier text
    CHECK (special_pickup_tier IN ('local', 'nearby', 'extended')),
  ADD COLUMN IF NOT EXISTS special_pickup_fee numeric(10, 2),
  ADD COLUMN IF NOT EXISTS errand_category text,
  ADD COLUMN IF NOT EXISTS errand_tier text
    CHECK (errand_tier IN ('simple', 'moderate', 'complex')),
  ADD COLUMN IF NOT EXISTS errand_fee numeric(10, 2),
  ADD COLUMN IF NOT EXISTS estimated_item_cost numeric(10, 2),
  ADD COLUMN IF NOT EXISTS actual_item_cost numeric(10, 2);

-- ============================================
-- 5. QR / PIN REBUILD (recipient self-scan, PRD §11.7)
-- ============================================
ALTER TABLE deliveries
  ADD COLUMN IF NOT EXISTS qr_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS completed_via text
    CHECK (completed_via IN ('qr_recipient', 'admin_fallback')),
  ADD COLUMN IF NOT EXISTS pin_attempt_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pin_locked_at timestamptz;

-- ============================================
-- 6. STATUS ENUM — ADD PENDING_MANUAL_QUOTE
-- ============================================
ALTER TABLE deliveries DROP CONSTRAINT IF EXISTS deliveries_status_check;
ALTER TABLE deliveries ADD CONSTRAINT deliveries_status_check CHECK (status IN (
  'draft', 'requested', 'pending_manual_quote', 'awaiting_payment', 'payment_submitted',
  'payment_confirmed', 'ready_for_dispatch', 'rider_assigned', 'picked_up', 'in_transit',
  'arrived', 'pin_verified', 'delivered', 'cancelled', 'delivery_failed'
));

-- ============================================
-- 7. QR TOKEN GENERATION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION generate_qr_token()
RETURNS text AS $$
DECLARE
  token text;
  exists boolean;
BEGIN
  LOOP
    token := encode(gen_random_bytes(16), 'hex');
    SELECT EXISTS(SELECT 1 FROM deliveries WHERE qr_token = token) INTO exists;
    IF NOT exists THEN
      RETURN token;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

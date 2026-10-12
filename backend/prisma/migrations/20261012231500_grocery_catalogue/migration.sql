-- Grocery catalogue owned by Sparrow. Products are not linked to a vendor.

CREATE TABLE "grocery_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(80) NOT NULL,
    "emoji" VARCHAR(16) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grocery_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grocery_products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(200),
    "unit" VARCHAR(40) NOT NULL,
    "price_naira" INTEGER NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grocery_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grocery_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customer_id" UUID NOT NULL,
    "destination_address" VARCHAR(200) NOT NULL,
    "destination_landmark" VARCHAR(200) NOT NULL DEFAULT '',
    "destination_contact_name" VARCHAR(80) NOT NULL,
    "destination_contact_phone" VARCHAR(20) NOT NULL,
    "goods_naira" INTEGER NOT NULL,
    "service_naira" INTEGER NOT NULL,
    "delivery_naira" INTEGER NOT NULL,
    "total_naira" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grocery_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grocery_order_lines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "unit" VARCHAR(40) NOT NULL,
    "unit_price_naira" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "line_naira" INTEGER NOT NULL,

    CONSTRAINT "grocery_order_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "grocery_products_category_id_is_available_idx" ON "grocery_products"("category_id", "is_available");
CREATE INDEX "grocery_orders_customer_id_idx" ON "grocery_orders"("customer_id");
CREATE INDEX "grocery_order_lines_order_id_idx" ON "grocery_order_lines"("order_id");

ALTER TABLE "grocery_products" ADD CONSTRAINT "grocery_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "grocery_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "grocery_orders" ADD CONSTRAINT "grocery_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "grocery_order_lines" ADD CONSTRAINT "grocery_order_lines_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "grocery_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grocery_order_lines" ADD CONSTRAINT "grocery_order_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "grocery_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "grocery_products" ADD CONSTRAINT "grocery_products_price_check" CHECK ("price_naira" > 0 AND "price_naira" <= 1000000);
ALTER TABLE "grocery_orders" ADD CONSTRAINT "grocery_orders_amounts_check" CHECK (
    "goods_naira" > 0
    AND "service_naira" > 0
    AND "delivery_naira" > 0
    AND "total_naira" = "goods_naira" + "service_naira" + "delivery_naira"
);
ALTER TABLE "grocery_order_lines" ADD CONSTRAINT "grocery_order_lines_amount_check" CHECK (
    "quantity" > 0
    AND "unit_price_naira" > 0
    AND "line_naira" = "unit_price_naira" * "quantity"
);

INSERT INTO "grocery_categories" ("id", "name", "emoji", "sort_order") VALUES
  ('018f0000-0000-7000-8000-000000000001', 'Dairy', '🥛', 1),
  ('018f0000-0000-7000-8000-000000000002', 'Bread & Bakery', '🍞', 2),
  ('018f0000-0000-7000-8000-000000000003', 'Rice & Grains', '🍚', 3),
  ('018f0000-0000-7000-8000-000000000004', 'Drinks', '🥤', 4),
  ('018f0000-0000-7000-8000-000000000005', 'Cooking Ingredients', '🧂', 5),
  ('018f0000-0000-7000-8000-000000000006', 'Fruits & Vegetables', '🍅', 6),
  ('018f0000-0000-7000-8000-000000000007', 'Household', '🧽', 7),
  ('018f0000-0000-7000-8000-000000000008', 'Personal Care', '🧴', 8);

INSERT INTO "grocery_products" ("id", "category_id", "name", "description", "unit", "price_naira", "is_available") VALUES
  ('018f0000-0000-7000-8000-000000001001', '018f0000-0000-7000-8000-000000000001', 'Peak Milk 400g', 'Evaporated milk', '400g tin', 3500, true),
  ('018f0000-0000-7000-8000-000000001002', '018f0000-0000-7000-8000-000000000001', 'Three Crowns 400g', 'Evaporated milk', '400g tin', 3300, true),
  ('018f0000-0000-7000-8000-000000001003', '018f0000-0000-7000-8000-000000000001', 'Hollandia Yoghurt', 'Plain yoghurt', '1L bottle', 2800, true),
  ('018f0000-0000-7000-8000-000000001004', '018f0000-0000-7000-8000-000000000001', 'Blue Band Butter', NULL, '250g tub', 1800, false),
  ('018f0000-0000-7000-8000-000000001005', '018f0000-0000-7000-8000-000000000002', 'Agege Bread', 'Sliced loaf', '1 loaf', 1500, true),
  ('018f0000-0000-7000-8000-000000001006', '018f0000-0000-7000-8000-000000000002', 'Butter Bread', NULL, '1 loaf', 2000, true),
  ('018f0000-0000-7000-8000-000000001007', '018f0000-0000-7000-8000-000000000002', 'Meat Pie', 'Freshly baked', 'per piece', 800, true),
  ('018f0000-0000-7000-8000-000000001008', '018f0000-0000-7000-8000-000000000003', 'Foreign Parboiled Rice', NULL, '5kg bag', 9500, true),
  ('018f0000-0000-7000-8000-000000001009', '018f0000-0000-7000-8000-000000000003', 'Foreign Parboiled Rice', NULL, '10kg bag', 18500, true),
  ('018f0000-0000-7000-8000-000000001010', '018f0000-0000-7000-8000-000000000003', 'Brown Beans', NULL, '1 derica', 1200, true),
  ('018f0000-0000-7000-8000-000000001011', '018f0000-0000-7000-8000-000000000003', 'Garri (Ijebu)', NULL, '1 derica', 900, true),
  ('018f0000-0000-7000-8000-000000001012', '018f0000-0000-7000-8000-000000000004', 'Coca-Cola', NULL, '35cl can', 500, true),
  ('018f0000-0000-7000-8000-000000001013', '018f0000-0000-7000-8000-000000000004', 'Bottled Water', NULL, '75cl bottle', 300, true),
  ('018f0000-0000-7000-8000-000000001014', '018f0000-0000-7000-8000-000000000004', 'Chivita Juice', 'Mixed fruit', '1L carton', 2200, true),
  ('018f0000-0000-7000-8000-000000001015', '018f0000-0000-7000-8000-000000000005', 'Groundnut Oil', NULL, '1L bottle', 4200, true),
  ('018f0000-0000-7000-8000-000000001016', '018f0000-0000-7000-8000-000000000005', 'Maggi Cubes', NULL, 'pack of 10', 600, true),
  ('018f0000-0000-7000-8000-000000001017', '018f0000-0000-7000-8000-000000000005', 'Table Salt', NULL, '500g pack', 350, true),
  ('018f0000-0000-7000-8000-000000001018', '018f0000-0000-7000-8000-000000000005', 'Fresh Pepper Mix', 'Blended tatashe & scotch bonnet', '1 rubber', 1500, false),
  ('018f0000-0000-7000-8000-000000001019', '018f0000-0000-7000-8000-000000000006', 'Fresh Tomatoes', NULL, '1 basket (small)', 1800, true),
  ('018f0000-0000-7000-8000-000000001020', '018f0000-0000-7000-8000-000000000006', 'Onions', NULL, '1 rubber', 1500, true),
  ('018f0000-0000-7000-8000-000000001021', '018f0000-0000-7000-8000-000000000006', 'Bananas', NULL, '1 bunch', 1000, true),
  ('018f0000-0000-7000-8000-000000001022', '018f0000-0000-7000-8000-000000000006', 'Eggs', NULL, 'crate of 30', 2500, true),
  ('018f0000-0000-7000-8000-000000001023', '018f0000-0000-7000-8000-000000000007', 'Omo Detergent', NULL, '900g pack', 1300, true),
  ('018f0000-0000-7000-8000-000000001024', '018f0000-0000-7000-8000-000000000007', 'Toilet Tissue', NULL, 'pack of 4', 1800, true),
  ('018f0000-0000-7000-8000-000000001025', '018f0000-0000-7000-8000-000000000007', 'Morning Fresh', 'Dishwashing liquid', '450ml bottle', 900, true),
  ('018f0000-0000-7000-8000-000000001026', '018f0000-0000-7000-8000-000000000008', 'Dettol Soap', NULL, 'per bar', 700, true),
  ('018f0000-0000-7000-8000-000000001027', '018f0000-0000-7000-8000-000000000008', 'Close-Up Toothpaste', NULL, '140g tube', 1100, true),
  ('018f0000-0000-7000-8000-000000001028', '018f0000-0000-7000-8000-000000000008', 'Always Pads', NULL, 'pack of 8', 1400, false);

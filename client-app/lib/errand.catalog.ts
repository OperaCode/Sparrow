import type { FoodItem, FoodVendor } from '@/types';

/** Approved food vendors. Groceries are served by the API, not this file. */

export const FOOD_VENDORS: FoodVendor[] = [
  {
    id: 'v-mamas-kitchen',
    name: "Mama's Kitchen",
    description: 'Home-style Nigerian meals, made fresh daily',
    image: null,
    community: 'igbesa',
    isActive: true,
  },
  {
    id: 'v-ades-kitchen',
    name: "Ade's Kitchen",
    description: 'Local favourites, grilled specials and swallow',
    image: null,
    community: 'lusada',
    isActive: true,
  },
  {
    id: 'v-blessing-spot',
    name: "Blessing's Spot",
    description: 'Soups, swallow and small chops',
    image: null,
    community: 'ketu',
    isActive: false,
  },
];

export const FOOD_ITEMS: FoodItem[] = [
  // Mama's Kitchen
  { id: 'f-mk-jollof', vendorId: 'v-mamas-kitchen', category: 'RICE', name: 'Jollof Rice', description: null, image: null, price: 2000, isAvailable: true },
  { id: 'f-mk-fried-rice', vendorId: 'v-mamas-kitchen', category: 'RICE', name: 'Fried Rice', description: null, image: null, price: 2500, isAvailable: true },
  { id: 'f-mk-white-rice', vendorId: 'v-mamas-kitchen', category: 'RICE', name: 'White Rice & Stew', description: null, image: null, price: 1500, isAvailable: true },
  { id: 'f-mk-chicken', vendorId: 'v-mamas-kitchen', category: 'PROTEIN', name: 'Chicken', description: '1 piece', image: null, price: 1500, isAvailable: true },
  { id: 'f-mk-beef', vendorId: 'v-mamas-kitchen', category: 'PROTEIN', name: 'Beef', description: '2 pieces', image: null, price: 1200, isAvailable: true },
  { id: 'f-mk-fish', vendorId: 'v-mamas-kitchen', category: 'PROTEIN', name: 'Fried Fish', description: null, image: null, price: 2000, isAvailable: false },
  { id: 'f-mk-coke', vendorId: 'v-mamas-kitchen', category: 'DRINKS', name: 'Coke', description: null, image: null, price: 500, isAvailable: true },
  { id: 'f-mk-water', vendorId: 'v-mamas-kitchen', category: 'DRINKS', name: 'Water', description: null, image: null, price: 300, isAvailable: true },

  // Ade's Kitchen
  { id: 'f-ak-amala', vendorId: 'v-ades-kitchen', category: 'SWALLOW', name: 'Amala & Ewedu', description: null, image: null, price: 1800, isAvailable: true },
  { id: 'f-ak-eba', vendorId: 'v-ades-kitchen', category: 'SWALLOW', name: 'Eba & Egusi', description: null, image: null, price: 1800, isAvailable: true },
  { id: 'f-ak-suya', vendorId: 'v-ades-kitchen', category: 'GRILLED', name: 'Beef Suya', description: 'Spicy grilled beef', image: null, price: 2500, isAvailable: true },
  { id: 'f-ak-turkey', vendorId: 'v-ades-kitchen', category: 'GRILLED', name: 'Grilled Turkey', description: null, image: null, price: 3000, isAvailable: true },
  { id: 'f-ak-malt', vendorId: 'v-ades-kitchen', category: 'DRINKS', name: 'Malt', description: null, image: null, price: 600, isAvailable: true },
];

export function getFoodVendorById(id: string): FoodVendor | null {
  return FOOD_VENDORS.find((v) => v.id === id) ?? null;
}

export function getFoodItemsByVendor(vendorId: string): FoodItem[] {
  return FOOD_ITEMS.filter((i) => i.vendorId === vendorId);
}

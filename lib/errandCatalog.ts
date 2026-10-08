import type { FoodItem, FoodVendor, GroceryCategory, GroceryProduct } from '@/types';

/**
 * Sparrow's own curated grocery catalogue and approved food vendor list.
 * Structured to map cleanly onto Supabase tables of the same shape later —
 * this file is the only thing that needs replacing when that happens.
 */

export const GROCERY_CATEGORIES: GroceryCategory[] = [
  { id: 'dairy', name: 'Dairy', emoji: '🥛' },
  { id: 'bakery', name: 'Bread & Bakery', emoji: '🍞' },
  { id: 'grains', name: 'Rice & Grains', emoji: '🍚' },
  { id: 'drinks', name: 'Drinks', emoji: '🥤' },
  { id: 'cooking', name: 'Cooking Ingredients', emoji: '🧂' },
  { id: 'produce', name: 'Fruits & Vegetables', emoji: '🍅' },
  { id: 'household', name: 'Household', emoji: '🧽' },
  { id: 'personal_care', name: 'Personal Care', emoji: '🧴' },
];

export const GROCERY_PRODUCTS: GroceryProduct[] = [
  // Dairy
  { id: 'g-peak-milk-400', categoryId: 'dairy', name: 'Peak Milk 400g', description: 'Evaporated milk', image: null, price: 3500, unit: '400g tin', isAvailable: true },
  { id: 'g-three-crowns-400', categoryId: 'dairy', name: 'Three Crowns 400g', description: 'Evaporated milk', image: null, price: 3300, unit: '400g tin', isAvailable: true },
  { id: 'g-hollandia-yog', categoryId: 'dairy', name: 'Hollandia Yoghurt', description: 'Plain yoghurt', image: null, price: 2800, unit: '1L bottle', isAvailable: true },
  { id: 'g-blue-band', categoryId: 'dairy', name: 'Blue Band Butter', description: null, image: null, price: 1800, unit: '250g tub', isAvailable: false },

  // Bread & Bakery
  { id: 'g-agege-bread', categoryId: 'bakery', name: 'Agege Bread', description: 'Sliced loaf', image: null, price: 1500, unit: '1 loaf', isAvailable: true },
  { id: 'g-butter-bread', categoryId: 'bakery', name: 'Butter Bread', description: null, image: null, price: 2000, unit: '1 loaf', isAvailable: true },
  { id: 'g-meat-pie', categoryId: 'bakery', name: 'Meat Pie', description: 'Freshly baked', image: null, price: 800, unit: 'per piece', isAvailable: true },

  // Rice & Grains
  { id: 'g-rice-5kg', categoryId: 'grains', name: 'Foreign Parboiled Rice', description: null, image: null, price: 9500, unit: '5kg bag', isAvailable: true },
  { id: 'g-rice-10kg', categoryId: 'grains', name: 'Foreign Parboiled Rice', description: null, image: null, price: 18500, unit: '10kg bag', isAvailable: true },
  { id: 'g-beans-derica', categoryId: 'grains', name: 'Brown Beans', description: null, image: null, price: 1200, unit: '1 derica', isAvailable: true },
  { id: 'g-garri-derica', categoryId: 'grains', name: 'Garri (Ijebu)', description: null, image: null, price: 900, unit: '1 derica', isAvailable: true },

  // Drinks
  { id: 'g-coke-can', categoryId: 'drinks', name: 'Coca-Cola', description: null, image: null, price: 500, unit: '35cl can', isAvailable: true },
  { id: 'g-water-bottle', categoryId: 'drinks', name: 'Bottled Water', description: null, image: null, price: 300, unit: '75cl bottle', isAvailable: true },
  { id: 'g-chivita', categoryId: 'drinks', name: 'Chivita Juice', description: 'Mixed fruit', image: null, price: 2200, unit: '1L carton', isAvailable: true },

  // Cooking Ingredients
  { id: 'g-groundnut-oil', categoryId: 'cooking', name: 'Groundnut Oil', description: null, image: null, price: 4200, unit: '1L bottle', isAvailable: true },
  { id: 'g-maggi', categoryId: 'cooking', name: 'Maggi Cubes', description: null, image: null, price: 600, unit: 'pack of 10', isAvailable: true },
  { id: 'g-salt', categoryId: 'cooking', name: 'Table Salt', description: null, image: null, price: 350, unit: '500g pack', isAvailable: true },
  { id: 'g-pepper-mix', categoryId: 'cooking', name: 'Fresh Pepper Mix', description: 'Blended tatashe & scotch bonnet', image: null, price: 1500, unit: '1 rubber', isAvailable: false },

  // Fruits & Vegetables
  { id: 'g-tomatoes', categoryId: 'produce', name: 'Fresh Tomatoes', description: null, image: null, price: 1800, unit: '1 basket (small)', isAvailable: true },
  { id: 'g-onions', categoryId: 'produce', name: 'Onions', description: null, image: null, price: 1500, unit: '1 rubber', isAvailable: true },
  { id: 'g-bananas', categoryId: 'produce', name: 'Bananas', description: null, image: null, price: 1000, unit: '1 bunch', isAvailable: true },
  { id: 'g-eggs-crate', categoryId: 'produce', name: 'Eggs', description: null, image: null, price: 2500, unit: 'crate of 30', isAvailable: true },

  // Household
  { id: 'g-detergent', categoryId: 'household', name: 'Omo Detergent', description: null, image: null, price: 1300, unit: '900g pack', isAvailable: true },
  { id: 'g-tissue', categoryId: 'household', name: 'Toilet Tissue', description: null, image: null, price: 1800, unit: 'pack of 4', isAvailable: true },
  { id: 'g-dishwash', categoryId: 'household', name: 'Morning Fresh', description: 'Dishwashing liquid', image: null, price: 900, unit: '450ml bottle', isAvailable: true },

  // Personal Care
  { id: 'g-soap', categoryId: 'personal_care', name: 'Dettol Soap', description: null, image: null, price: 700, unit: 'per bar', isAvailable: true },
  { id: 'g-toothpaste', categoryId: 'personal_care', name: 'Close-Up Toothpaste', description: null, image: null, price: 1100, unit: '140g tube', isAvailable: true },
  { id: 'g-sanitary-pads', categoryId: 'personal_care', name: 'Always Pads', description: null, image: null, price: 1400, unit: 'pack of 8', isAvailable: false },
];

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

export function getGroceryCategoryById(id: string): GroceryCategory | null {
  return GROCERY_CATEGORIES.find((c) => c.id === id) ?? null;
}

export function getGroceryProductsByCategory(categoryId: string): GroceryProduct[] {
  return GROCERY_PRODUCTS.filter((p) => p.categoryId === categoryId);
}

export function getFoodVendorById(id: string): FoodVendor | null {
  return FOOD_VENDORS.find((v) => v.id === id) ?? null;
}

export function getFoodItemsByVendor(vendorId: string): FoodItem[] {
  return FOOD_ITEMS.filter((i) => i.vendorId === vendorId);
}

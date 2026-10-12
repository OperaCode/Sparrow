export const CURRENCY = "NGN" as const;

export interface GroceryCategoryRecord {
  id: string;
  name: string;
  emoji: string;
}

export interface GroceryProductRecord {
  id: string;
  categoryId: string;
  name: string;
  unit: string;
  priceNaira: number;
}

export interface FeeRule {
  quoteMode: "automatic" | "manual";
  amountNaira: number | null;
}

export interface GroceryFees {
  service: FeeRule | null;
  delivery: FeeRule | null;
}

export interface GroceryDestination {
  destinationAddress: string;
  destinationLandmark: string;
  destinationContactName: string;
  destinationContactPhone: string;
}

export interface GroceryQuote {
  currency: typeof CURRENCY;
  goodsNaira: number;
  serviceNaira: number;
  deliveryNaira: number;
  totalNaira: number;
  lines: {
    productId: string;
    name: string;
    unit: string;
    unitPriceNaira: number;
    quantity: number;
    lineNaira: number;
  }[];
}

export interface GroceryOrderRecord extends GroceryQuote {
  id: string;
  destination: GroceryDestination;
}

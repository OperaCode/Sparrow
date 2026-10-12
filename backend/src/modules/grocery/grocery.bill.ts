const MAX_NAIRA = 1_000_000;
const MAX_TOTAL_NAIRA = MAX_NAIRA * 3;

export interface BillRequestLine {
  productId: string;
  quantity: number;
}

export interface StockedProduct {
  id: string;
  name: string;
  unit: string;
  priceNaira: number;
  isAvailable: boolean;
}

export interface GroceryBillLine {
  productId: string;
  name: string;
  unit: string;
  unitPriceNaira: number;
  quantity: number;
  lineNaira: number;
}

export interface GroceryBill {
  goodsNaira: number;
  serviceNaira: number;
  deliveryNaira: number;
  totalNaira: number;
  lines: GroceryBillLine[];
}

export type BillFailure =
  "duplicate" | "missing" | "unavailable" | "unpriced" | "too_large";

export type BillResult =
  { ok: true; bill: GroceryBill } | { ok: false; code: BillFailure };

function chargeable(amount: number): boolean {
  return Number.isSafeInteger(amount) && amount > 0 && amount <= MAX_NAIRA;
}

/**
 * Goods are the catalogue prices times quantity. Service and delivery are
 * separate legs and are never folded into the goods figure.
 */
export function buildBill(
  requested: readonly BillRequestLine[],
  products: readonly StockedProduct[],
  serviceNaira: number | null,
  deliveryNaira: number | null,
): BillResult {
  const ids = requested.map((line) => line.productId);
  const uniqueCount = ids.filter(
    (id, index) => ids.indexOf(id) === index,
  ).length;
  if (uniqueCount !== ids.length) return { ok: false, code: "duplicate" };
  if (serviceNaira === null || !chargeable(serviceNaira)) {
    return { ok: false, code: "unpriced" };
  }
  if (deliveryNaira === null || !chargeable(deliveryNaira)) {
    return { ok: false, code: "unpriced" };
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const lines: GroceryBillLine[] = [];

  for (const requestedLine of requested) {
    const product = productById.get(requestedLine.productId);
    if (product === undefined) return { ok: false, code: "missing" };
    if (!product.isAvailable) return { ok: false, code: "unavailable" };
    if (!chargeable(product.priceNaira)) return { ok: false, code: "unpriced" };

    const lineNaira = product.priceNaira * requestedLine.quantity;
    if (!chargeable(lineNaira)) return { ok: false, code: "too_large" };

    lines.push({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      unitPriceNaira: product.priceNaira,
      quantity: requestedLine.quantity,
      lineNaira,
    });
  }

  const goodsNaira = lines.reduce((sum, line) => sum + line.lineNaira, 0);
  if (!chargeable(goodsNaira)) return { ok: false, code: "too_large" };

  const totalNaira = goodsNaira + serviceNaira + deliveryNaira;
  if (!Number.isSafeInteger(totalNaira) || totalNaira > MAX_TOTAL_NAIRA) {
    return { ok: false, code: "too_large" };
  }

  return {
    ok: true,
    bill: {
      goodsNaira,
      serviceNaira,
      deliveryNaira,
      totalNaira,
      lines,
    },
  };
}

import type { Prisma } from "../../generated/prisma/client.js";
import type { PrismaClient } from "../../lib/prisma.js";
import type { GroceryBill } from "./grocery.bill.js";
import type {
  FeeRule,
  GroceryCategoryRecord,
  GroceryDestination,
  GroceryFees,
  GroceryOrderRecord,
  GroceryProductRecord,
} from "./grocery.types.js";
import { CURRENCY } from "./grocery.types.js";
import type { BillRequestLine, StockedProduct } from "./grocery.bill.js";

type Db = PrismaClient | Prisma.TransactionClient;

export interface CatalogueSnapshot {
  products: StockedProduct[];
  fees: GroceryFees;
}

export interface GroceryRepository {
  listCategories(): Promise<GroceryCategoryRecord[]>;
  listAvailableProducts(
    categoryId: string,
  ): Promise<GroceryProductRecord[] | null>;
  loadCatalogue(lines: readonly BillRequestLine[]): Promise<CatalogueSnapshot>;
  insertOrder(
    customerId: string,
    destination: GroceryDestination,
    lines: readonly BillRequestLine[],
    price: (snapshot: CatalogueSnapshot) => GroceryBill,
  ): Promise<GroceryOrderRecord>;
}

function toFee(
  rule: { quoteMode: string; amountNaira: number | null } | null,
): FeeRule | null {
  if (rule === null) return null;
  if (rule.quoteMode !== "automatic" && rule.quoteMode !== "manual")
    return null;
  return { quoteMode: rule.quoteMode, amountNaira: rule.amountNaira };
}

async function loadCatalogue(
  db: Db,
  lines: readonly BillRequestLine[],
): Promise<CatalogueSnapshot> {
  const ids = lines.map((line) => line.productId);
  const [products, rules] = await Promise.all([
    db.groceryProduct.findMany({ where: { id: { in: ids } } }),
    db.priceRule.findMany({
      where: {
        OR: [
          { component: "errand", tier: "simple" },
          { component: "standard_zone", tier: "A" },
        ],
      },
    }),
  ]);

  const service =
    rules.find(
      (rule) => rule.component === "errand" && rule.tier === "simple",
    ) ?? null;
  const delivery =
    rules.find(
      (rule) => rule.component === "standard_zone" && rule.tier === "A",
    ) ?? null;

  return {
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      unit: product.unit,
      priceNaira: product.priceNaira,
      isAvailable: product.isAvailable,
    })),
    fees: { service: toFee(service), delivery: toFee(delivery) },
  };
}

function toOrder(order: {
  id: string;
  destinationAddress: string;
  destinationLandmark: string;
  destinationContactName: string;
  destinationContactPhone: string;
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
}): GroceryOrderRecord {
  return {
    id: order.id,
    currency: CURRENCY,
    goodsNaira: order.goodsNaira,
    serviceNaira: order.serviceNaira,
    deliveryNaira: order.deliveryNaira,
    totalNaira: order.totalNaira,
    lines: order.lines.map((line) => ({
      productId: line.productId,
      name: line.name,
      unit: line.unit,
      unitPriceNaira: line.unitPriceNaira,
      quantity: line.quantity,
      lineNaira: line.lineNaira,
    })),
    destination: {
      destinationAddress: order.destinationAddress,
      destinationLandmark: order.destinationLandmark,
      destinationContactName: order.destinationContactName,
      destinationContactPhone: order.destinationContactPhone,
    },
  };
}

export function createGroceryRepository(
  prisma: PrismaClient,
): GroceryRepository {
  return {
    async listCategories() {
      const rows = await prisma.groceryCategory.findMany({
        orderBy: { sortOrder: "asc" },
      });
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        emoji: row.emoji,
      }));
    },

    async listAvailableProducts(categoryId) {
      const category = await prisma.groceryCategory.findUnique({
        where: { id: categoryId },
      });
      if (category === null) return null;

      const rows = await prisma.groceryProduct.findMany({
        where: { categoryId, isAvailable: true },
        orderBy: { name: "asc" },
      });
      return rows.map((row) => ({
        id: row.id,
        categoryId: row.categoryId,
        name: row.name,
        unit: row.unit,
        priceNaira: row.priceNaira,
      }));
    },

    loadCatalogue(lines) {
      return loadCatalogue(prisma, lines);
    },

    async insertOrder(customerId, destination, lines, price) {
      const order = await prisma.$transaction(async (tx) => {
        const snapshot = await loadCatalogue(tx, lines);
        const bill = price(snapshot);
        return tx.groceryOrder.create({
          data: {
            customerId,
            destinationAddress: destination.destinationAddress,
            destinationLandmark: destination.destinationLandmark,
            destinationContactName: destination.destinationContactName,
            destinationContactPhone: destination.destinationContactPhone,
            goodsNaira: bill.goodsNaira,
            serviceNaira: bill.serviceNaira,
            deliveryNaira: bill.deliveryNaira,
            totalNaira: bill.totalNaira,
            lines: {
              create: bill.lines.map((line) => ({
                productId: line.productId,
                name: line.name,
                unit: line.unit,
                unitPriceNaira: line.unitPriceNaira,
                quantity: line.quantity,
                lineNaira: line.lineNaira,
              })),
            },
          },
          include: { lines: true },
        });
      });
      return toOrder(order);
    },
  };
}

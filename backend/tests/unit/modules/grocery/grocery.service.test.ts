import { describe, expect, it } from "vitest";
import { ConflictError, NotFoundError } from "../../../../src/http/errors.js";
import { createLogger } from "../../../../src/lib/logger.js";
import type { BillRequestLine } from "../../../../src/modules/grocery/grocery.bill.js";
import type {
  CatalogueSnapshot,
  GroceryRepository,
} from "../../../../src/modules/grocery/grocery.repository.js";
import { createGroceryService } from "../../../../src/modules/grocery/grocery.service.js";
import type { GroceryDestination } from "../../../../src/modules/grocery/grocery.types.js";

const milkId = "018f0000-0000-7000-8000-000000001001";

const fees = {
  service: { quoteMode: "automatic" as const, amountNaira: 500 },
  delivery: { quoteMode: "automatic" as const, amountNaira: 800 },
};

function repository(snapshot: CatalogueSnapshot): GroceryRepository {
  return {
    listCategories: () => Promise.resolve([]),
    listAvailableProducts: () => Promise.resolve([]),
    loadCatalogue: () => Promise.resolve(snapshot),
    insertOrder: (_customerId, _destination, _lines, price) => {
      const bill = price(snapshot);
      return Promise.resolve({
        id: "018f0000-0000-7000-8000-000000009001",
        currency: "NGN",
        ...bill,
        destination: {
          destinationAddress: "Igbesa",
          destinationLandmark: "",
          destinationContactName: "Ada",
          destinationContactPhone: "08012345678",
        },
      });
    },
  };
}

const lines: BillRequestLine[] = [{ productId: milkId, quantity: 1 }];
const destination: GroceryDestination = {
  destinationAddress: "Igbesa",
  destinationLandmark: "",
  destinationContactName: "Ada",
  destinationContactPhone: "08012345678",
};

function serviceFor(snapshot: CatalogueSnapshot) {
  return createGroceryService({
    repository: repository(snapshot),
    logger: createLogger({ level: "silent", nodeEnv: "test" }),
  });
}

describe("grocery service", () => {
  it("prices goods from the catalogue and adds the two fees", async () => {
    const quote = await serviceFor({
      products: [
        {
          id: milkId,
          name: "Peak Milk 400g",
          unit: "400g tin",
          priceNaira: 3500,
          isAvailable: true,
        },
      ],
      fees,
    }).quote(lines);

    expect(quote).toMatchObject({
      goodsNaira: 3500,
      serviceNaira: 500,
      deliveryNaira: 800,
      totalNaira: 4800,
    });
  });

  it("refuses an unavailable product", async () => {
    const quote = serviceFor({
      products: [
        {
          id: milkId,
          name: "Peak Milk 400g",
          unit: "400g tin",
          priceNaira: 3500,
          isAvailable: false,
        },
      ],
      fees,
    }).quote(lines);

    await expect(quote).rejects.toBeInstanceOf(ConflictError);
  });

  it("snapshots the same bill onto the order", async () => {
    const order = await serviceFor({
      products: [
        {
          id: milkId,
          name: "Peak Milk 400g",
          unit: "400g tin",
          priceNaira: 3500,
          isAvailable: true,
        },
      ],
      fees,
    }).createOrder("customer", lines, destination);

    expect(order.totalNaira).toBe(4800);
    expect(order.lines[0]?.unitPriceNaira).toBe(3500);
  });

  it("fails when the category does not exist", async () => {
    const missing = createGroceryService({
      repository: {
        ...repository({ products: [], fees }),
        listAvailableProducts: () => Promise.resolve(null),
      },
      logger: createLogger({ level: "silent", nodeEnv: "test" }),
    }).listAvailableProducts(milkId);

    await expect(missing).rejects.toBeInstanceOf(NotFoundError);
  });
});

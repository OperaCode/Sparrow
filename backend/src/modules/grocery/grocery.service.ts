import {
  ConflictError,
  NotFoundError,
  ServiceUnavailableError,
  ValidationError,
} from "../../http/errors.js";
import type { Logger } from "../../lib/logger.js";
import {
  buildBill,
  type BillFailure,
  type BillRequestLine,
  type GroceryBill,
} from "./grocery.bill.js";
import type { GroceryRepository } from "./grocery.repository.js";
import {
  CURRENCY,
  type GroceryCategoryRecord,
  type GroceryDestination,
  type GroceryOrderRecord,
  type GroceryProductRecord,
  type GroceryQuote,
} from "./grocery.types.js";

export interface GroceryService {
  listCategories(): Promise<GroceryCategoryRecord[]>;
  listAvailableProducts(categoryId: string): Promise<GroceryProductRecord[]>;
  quote(lines: readonly BillRequestLine[]): Promise<GroceryQuote>;
  createOrder(
    customerId: string,
    lines: readonly BillRequestLine[],
    destination: GroceryDestination,
  ): Promise<GroceryOrderRecord>;
}

function feeAmount(
  rule: { quoteMode: string; amountNaira: number | null } | null,
): number | null {
  if (rule === null) return null;
  if (rule.quoteMode !== "automatic") return null;
  return rule.amountNaira;
}

function rejectBill(code: BillFailure): never {
  if (code === "duplicate") {
    throw new ValidationError([
      { path: "body.lines", message: "Each product can appear only once" },
    ]);
  }
  if (code === "missing") throw new NotFoundError("Grocery product not found");
  if (code === "unavailable") {
    throw new ConflictError("That product is not available");
  }
  if (code === "too_large") {
    throw new ValidationError([
      { path: "body.lines", message: "The grocery total is too large" },
    ]);
  }
  throw new ServiceUnavailableError("Pricing is temporarily unavailable");
}

function toQuote(bill: GroceryBill): GroceryQuote {
  return { currency: CURRENCY, ...bill };
}

export function createGroceryService(deps: {
  repository: GroceryRepository;
  logger: Logger;
}): GroceryService {
  const { repository, logger } = deps;

  function price(
    snapshot: {
      products: Parameters<typeof buildBill>[1];
      fees: {
        service: { quoteMode: string; amountNaira: number | null } | null;
        delivery: { quoteMode: string; amountNaira: number | null } | null;
      };
    },
    lines: readonly BillRequestLine[],
  ): GroceryBill {
    const result = buildBill(
      lines,
      snapshot.products,
      feeAmount(snapshot.fees.service),
      feeAmount(snapshot.fees.delivery),
    );
    if (!result.ok && result.code === "unpriced") {
      logger.error("Grocery fees or a catalogue price cannot be charged");
    }
    if (!result.ok) rejectBill(result.code);
    return result.bill;
  }

  return {
    listCategories() {
      return repository.listCategories();
    },

    async listAvailableProducts(categoryId) {
      const products = await repository.listAvailableProducts(categoryId);
      if (products === null)
        throw new NotFoundError("Grocery category not found");
      return products;
    },

    async quote(lines) {
      return toQuote(price(await repository.loadCatalogue(lines), lines));
    },

    createOrder(customerId, lines, destination) {
      return repository.insertOrder(
        customerId,
        destination,
        lines,
        (snapshot) => price(snapshot, lines),
      );
    },
  };
}

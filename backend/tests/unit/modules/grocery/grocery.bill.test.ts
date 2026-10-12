import { describe, expect, it } from "vitest";
import {
  buildBill,
  type StockedProduct,
} from "../../../../src/modules/grocery/grocery.bill.js";

const milk: StockedProduct = {
  id: "018f0000-0000-7000-8000-000000001001",
  name: "Peak Milk 400g",
  unit: "400g tin",
  priceNaira: 3500,
  isAvailable: true,
};

const butter: StockedProduct = {
  id: "018f0000-0000-7000-8000-000000001004",
  name: "Blue Band Butter",
  unit: "250g tub",
  priceNaira: 1800,
  isAvailable: false,
};

describe("grocery bill", () => {
  it("keeps goods, service, and delivery as separate legs", () => {
    const result = buildBill(
      [{ productId: milk.id, quantity: 2 }],
      [milk],
      500,
      800,
    );

    expect(result).toEqual({
      ok: true,
      bill: {
        goodsNaira: 7000,
        serviceNaira: 500,
        deliveryNaira: 800,
        totalNaira: 8300,
        lines: [
          {
            productId: milk.id,
            name: milk.name,
            unit: milk.unit,
            unitPriceNaira: 3500,
            quantity: 2,
            lineNaira: 7000,
          },
        ],
      },
    });
  });

  it("rejects an unavailable product before pricing it", () => {
    const result = buildBill(
      [{ productId: butter.id, quantity: 1 }],
      [butter],
      500,
      800,
    );
    expect(result).toEqual({ ok: false, code: "unavailable" });
  });

  it("rejects a product that is not in the catalogue", () => {
    const result = buildBill(
      [{ productId: milk.id, quantity: 1 }],
      [],
      500,
      800,
    );
    expect(result).toEqual({ ok: false, code: "missing" });
  });

  it("rejects the same product twice", () => {
    const result = buildBill(
      [
        { productId: milk.id, quantity: 1 },
        { productId: milk.id, quantity: 2 },
      ],
      [milk],
      500,
      800,
    );
    expect(result).toEqual({ ok: false, code: "duplicate" });
  });

  it("does not treat a missing fee as zero", () => {
    const result = buildBill(
      [{ productId: milk.id, quantity: 1 }],
      [milk],
      null,
      800,
    );
    expect(result).toEqual({ ok: false, code: "unpriced" });
  });
});

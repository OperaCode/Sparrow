import request, { type Response } from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createGroceryModules } from "../../../src/modules/grocery/grocery.module.js";
import { createLogger } from "../../../src/lib/logger.js";
import { seedApprovedPrices } from "../../../src/modules/pricing/pricing.repository.js";
import { createUsersRepository } from "../../../src/modules/users/users.repository.js";
import { createTestAccount } from "../../helpers/account.js";
import { buildTestApp, testConfig } from "../../helpers/app.js";
import { createTestPrisma, truncateAllTables } from "../../helpers/database.js";

const prisma = createTestPrisma();
const config = testConfig();
const { app } = buildTestApp({
  config,
  authSubjects: createUsersRepository(prisma),
  v1Modules: createGroceryModules({
    prisma,
    logger: createLogger({ level: "silent", nodeEnv: "test" }),
  }),
});

const categoryId = "018f0000-0000-7000-8000-000000000001";
const milkId = "018f0000-0000-7000-8000-000000001001";
const butterId = "018f0000-0000-7000-8000-000000001004";

beforeEach(async () => {
  await truncateAllTables(prisma);
  await seedApprovedPrices(prisma);
  await prisma.groceryCategory.create({
    data: {
      id: categoryId,
      name: "Dairy",
      emoji: "🥛",
      sortOrder: 1,
      products: {
        create: [
          {
            id: milkId,
            name: "Peak Milk 400g",
            unit: "400g tin",
            priceNaira: 3500,
            isAvailable: true,
          },
          {
            id: butterId,
            name: "Blue Band Butter",
            unit: "250g tub",
            priceNaira: 1800,
            isAvailable: false,
          },
        ],
      },
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

function dataOf(response: Response): { id: string } {
  return (response.body as { data: { id: string } }).data;
}

describe("grocery catalogue", () => {
  it("lists categories and only available products", async () => {
    const categories = await request(app)
      .get("/api/v1/groceries/categories")
      .expect(200);
    expect(dataOf(categories)).toEqual([
      { id: categoryId, name: "Dairy", emoji: "🥛" },
    ]);

    const products = await request(app)
      .get(`/api/v1/groceries/categories/${categoryId}/products`)
      .expect(200);
    expect(dataOf(products)).toEqual([
      {
        id: milkId,
        categoryId,
        name: "Peak Milk 400g",
        unit: "400g tin",
        priceNaira: 3500,
      },
    ]);
  });

  it("quotes goods separately from the service and delivery fees", async () => {
    const response = await request(app)
      .post("/api/v1/groceries/quotes")
      .send({ lines: [{ productId: milkId, quantity: 2 }] })
      .expect(200);

    expect(dataOf(response)).toMatchObject({
      currency: "NGN",
      goodsNaira: 7000,
      serviceNaira: 500,
      deliveryNaira: 800,
      totalNaira: 8300,
    });
  });

  it("rejects a client-sent price", async () => {
    await request(app)
      .post("/api/v1/groceries/quotes")
      .send({
        lines: [{ productId: milkId, quantity: 1, unitPriceNaira: 1 }],
      })
      .expect(400);
  });

  it("rejects an unavailable product", async () => {
    await request(app)
      .post("/api/v1/groceries/quotes")
      .send({ lines: [{ productId: butterId, quantity: 1 }] })
      .expect(409);
  });

  it("stores the quoted amounts on the order", async () => {
    const customer = await createTestAccount(
      prisma,
      "+2348041000001",
      "customer",
      config,
    );

    const response = await request(app)
      .post("/api/v1/groceries/orders")
      .set("Authorization", `Bearer ${customer.token}`)
      .send({
        lines: [{ productId: milkId, quantity: 1 }],
        destinationAddress: "Igbesa Junction",
        destinationContactName: "Ada",
        destinationContactPhone: "08012345678",
      })
      .expect(201);

    const created = dataOf(response);
    expect(created).toMatchObject({
      goodsNaira: 3500,
      serviceNaira: 500,
      deliveryNaira: 800,
      totalNaira: 4800,
    });

    await prisma.groceryProduct.update({
      where: { id: milkId },
      data: { priceNaira: 9999 },
    });
    const stored = await prisma.groceryOrder.findUniqueOrThrow({
      where: { id: created.id },
      include: { lines: true },
    });
    expect(stored.goodsNaira).toBe(3500);
    expect(stored.lines[0]?.unitPriceNaira).toBe(3500);
  });
});

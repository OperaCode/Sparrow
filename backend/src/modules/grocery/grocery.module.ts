import { Router } from "express";
import type { V1Module } from "../../api/v1/router.js";
import { validate } from "../../http/middleware/validate.middleware.js";
import type { Logger } from "../../lib/logger.js";
import type { PrismaClient } from "../../lib/prisma.js";
import { createGroceryController } from "./grocery.controller.js";
import { createGroceryRepository } from "./grocery.repository.js";
import {
  categoryParamsSchema,
  orderBodySchema,
  quoteBodySchema,
} from "./grocery.schema.js";
import { createGroceryService } from "./grocery.service.js";

export function createGroceryModules(deps: {
  prisma: PrismaClient;
  logger: Logger;
}): readonly V1Module[] {
  const controller = createGroceryController(
    createGroceryService({
      repository: createGroceryRepository(deps.prisma),
      logger: deps.logger,
    }),
  );

  const groceries: V1Module = {
    path: "/groceries",
    createRouter({ authenticate, requireRole }) {
      const router = Router();
      router.get("/categories", controller.listCategories);
      router.get(
        "/categories/:categoryId/products",
        validate({ params: categoryParamsSchema }),
        controller.listProducts,
      );
      router.post(
        "/quotes",
        validate({ body: quoteBodySchema }),
        controller.quote,
      );
      router.post(
        "/orders",
        authenticate,
        requireRole("customer"),
        validate({ body: orderBodySchema }),
        controller.createOrder,
      );
      return router;
    },
  };

  return [groceries];
}

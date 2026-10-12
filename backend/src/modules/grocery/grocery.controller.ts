import type { Request, RequestHandler } from "express";
import type { z } from "zod";
import { UnauthorizedError } from "../../http/errors.js";
import { sendData } from "../../http/response.js";
import type { AuthContext } from "../../types/auth.js";
import type {
  categoryParamsSchema,
  orderBodySchema,
  quoteBodySchema,
} from "./grocery.schema.js";
import type { GroceryService } from "./grocery.service.js";

export interface GroceryController {
  listCategories: RequestHandler;
  listProducts: RequestHandler;
  quote: RequestHandler;
  createOrder: RequestHandler;
}

function requireAuth(req: Request): AuthContext {
  if (req.auth === undefined) throw new UnauthorizedError();
  return req.auth;
}

function bodyOf(req: Request): unknown {
  return req.body;
}

export function createGroceryController(
  service: GroceryService,
): GroceryController {
  return {
    listCategories: async (_req, res) => {
      sendData(res, await service.listCategories());
    },

    listProducts: async (req, res) => {
      const params = req.params as z.output<typeof categoryParamsSchema>;
      sendData(res, await service.listAvailableProducts(params.categoryId));
    },

    quote: async (req, res) => {
      const body = bodyOf(req) as z.output<typeof quoteBodySchema>;
      sendData(res, await service.quote(body.lines));
    },

    createOrder: async (req, res) => {
      const { userId } = requireAuth(req);
      const body = bodyOf(req) as z.output<typeof orderBodySchema>;
      const order = await service.createOrder(userId, body.lines, {
        destinationAddress: body.destinationAddress,
        destinationLandmark: body.destinationLandmark ?? "",
        destinationContactName: body.destinationContactName,
        destinationContactPhone: body.destinationContactPhone,
      });
      sendData(res, order, { status: 201 });
    },
  };
}

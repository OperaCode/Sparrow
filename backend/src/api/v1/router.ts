import { Router } from 'express';

/**
 * Entry point for every /api/v1 module router. Additive changes stay in v1;
 * a breaking change gets a v2 router mounted alongside this one.
 */
export function createV1Router(): Router {
  return Router();
}

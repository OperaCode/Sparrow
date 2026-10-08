import express, { type Express } from 'express';
import { createV1Router } from './api/v1/router.js';
import type { Config } from './config/env.js';
import { createErrorHandler } from './http/middleware/error-handler.js';
import { createHttpLogger } from './http/middleware/http-logger.js';
import { notFound } from './http/middleware/not-found.js';
import { requestId } from './http/middleware/request-id.js';
import type { Logger } from './lib/logger.js';
import { createHealthController } from './modules/health/health.controller.js';
import { createHealthRouter } from './modules/health/health.routes.js';
import type { HealthService } from './modules/health/health.service.js';

export interface AppDependencies {
  config: Config;
  logger: Logger;
  healthService: HealthService;
}

const JSON_BODY_LIMIT = '100kb';

/**
 * Builds the Express app from injected dependencies and never touches the
 * network or process state, so tests can construct it freely.
 */
export function createApp(deps: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', deps.config.http.trustProxy);

  app.use(requestId);
  app.use(createHttpLogger(deps.logger));
  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  app.use(
    '/health',
    createHealthRouter(createHealthController(deps.healthService)),
  );
  app.use('/api/v1', createV1Router());

  app.use(notFound);
  app.use(createErrorHandler(deps.logger));

  return app;
}

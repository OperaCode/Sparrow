import type { Express } from 'express';
import { createApp } from '../../src/app.js';
import { loadConfig, type Config } from '../../src/config/env.js';
import { createLogger, type Logger } from '../../src/lib/logger.js';
import type { HealthRepository } from '../../src/modules/health/health.repository.js';
import {
  createHealthService,
  type HealthService,
} from '../../src/modules/health/health.service.js';
import { createLogCapture, type LogCapture } from './log-capture.js';

export const TEST_JWT_SECRET = 'test-only-secret-never-used-outside-tests';

export function testConfig(overrides: NodeJS.ProcessEnv = {}): Config {
  return loadConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'info',
    DATABASE_URL: 'postgresql://unused:unused@localhost:5433/unused_test',
    JWT_ACCESS_SECRET: TEST_JWT_SECRET,
    ...overrides,
  });
}

export const healthyRepository: HealthRepository = {
  pingDatabase: () => Promise.resolve(),
};

interface TestAppOptions {
  config?: Config;
  healthRepository?: HealthRepository;
  healthService?: HealthService;
}

export interface TestApp {
  app: Express;
  logs: LogCapture;
  logger: Logger;
}

export function buildTestApp(options: TestAppOptions = {}): TestApp {
  const config = options.config ?? testConfig();
  const logs = createLogCapture();
  const logger = createLogger(
    { level: config.logLevel, nodeEnv: config.nodeEnv },
    logs.stream,
  );
  const healthService =
    options.healthService ??
    createHealthService({
      repository: options.healthRepository ?? healthyRepository,
      logger,
    });

  return { app: createApp({ config, logger, healthService }), logs, logger };
}

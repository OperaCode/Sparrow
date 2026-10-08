import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

export const REQUEST_ID_HEADER = 'X-Request-Id';

const SAFE_REQUEST_ID = /^[A-Za-z0-9-]{8,64}$/;

/**
 * Trusts a caller-supplied id only when it is short and charset-restricted, so
 * it cannot be used to inject content into logs or response headers.
 */
export function resolveRequestId(incoming: string | undefined): string {
  return incoming !== undefined && SAFE_REQUEST_ID.test(incoming)
    ? incoming
    : randomUUID();
}

export const requestId: RequestHandler = (req, res, next) => {
  const id = resolveRequestId(req.get(REQUEST_ID_HEADER));
  req.id = id;
  res.setHeader(REQUEST_ID_HEADER, id);
  next();
};

# Backend

This is a production codebase. Code stays high quality and follows the rules below.

This package is Express, Zod, and Prisma on PostgreSQL. It is not NestJS and it is not MongoDB. Add a feature as `src/modules/<name>/` and register it from `src/api/v1/modules.ts`. Match `pricing`: `.module.ts`, `.controller.ts`, `.service.ts`, `.repository.ts`, `.schema.ts`, `.types.ts`. Keep pure calculations in their own file.

## Naming

Do not use single-letter names. Use a short name that says what the value is: `product`, `index`, `error`, not `p`, `i`, `e`.

Do not name a value `normalize`, `normalized`, or the like. Name what it is: `phone`, `amountNaira`.

Keep function names short: `findMains`, `hasProducts`, `assertOpen`. Not `findMainCategoriesBlockedForDirectProducts`.

Files are `name.role`, as in `pricing.service.ts`.

Index a list with `Map` when later code looks up by id. Do not use `Set` to dedupe or test membership. Dedupe with `filter` and `includes`.

## Control flow

Guard the negative case and return. The happy path stays flat at the end of the function. Do not use `else`, `else if`, or an `if` inside an `if`.

Do not nest an `if` inside a loop, or a loop inside an `if`. Extract a helper, or use `filter`, `map`, or `flatMap`. A loop body has one guard and returns or continues.

Do not use `let`. Derive the value in a function and assign it with `const`.

```ts
if (!categoryName) return;
if (!translation) return;
await persist(translation);
```

Do not add a check Zod or the types already guarantee. Do not query inside a loop. Load the rows once and index them. Do not nest loops. Extract a function when a second caller needs the same behavior.

```ts
const productById = new Map(products.map((product) => [product.id, product]));
```

## Layers

Only the repository imports Prisma. `http/`, `lib/`, and `config/` do not import from `modules/`.

`.schema.ts` is the Zod contract for params, query, and body. Trim and reject unknown fields here (`z.strictObject`). A client-sent price, role, or vendor id fails validation. Controllers and services do not trim or sanitize a value that already came through the schema.

`.repository.ts` is the only database access for the module.

`.service.ts` is the business layer over that repository. It does not import Express. It serves its own controller. It may call another module only through that module's exported service or repository.

A service function stays small. It trusts the schema: the body already has the right shape. Pass the object the function needs (`user`, `order`), not a bare id, when it uses more than the id. A failed business rule throws an `AppError` from `src/http/errors.ts`. The service does not catch it.

`.controller.ts` is the HTTP layer. It reads the validated input, calls its own service, and responds with `sendData`. It does not call another module's service, and it does not return a Prisma row. `authenticate` and `requireRole` on the route are the role gate. Ownership of a row is checked in the service.

`.module.ts` wires repository, service, and controller and returns the `V1Module`. It does not export the controller for other modules to mount.

`.types.ts` is the module's domain types. Shared config lives in `src/config/`. A feature file keeps domain logic only. Generic helpers belong in `src/lib/` or `src/http/`, and only when a second caller needs them.

## Data

Edit `prisma/schema.prisma`, then run `npm run db:migrate:dev -- --name <change>`. Do not edit a migration that has already been applied. Map tables and columns to snake_case with `@@map` and `@map`. Ids are database-generated UUIDs.

Store money as whole naira. When an order is priced, copy the goods amount and each fee onto the order.

Grocery products have no vendor foreign key. Availability is Sparrow's flag. The service rejects an unavailable product before any order row is written.

## HTTP

Success uses `sendData`: `200` for a read or update, `201` for a create. The error middleware maps thrown errors:

| Status | Code | When |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR`, `INVALID_JSON`, `BAD_REQUEST` | Wrong shape, bad JSON, or a malformed call |
| 401 | `UNAUTHENTICATED` | Missing or invalid bearer token |
| 403 | `FORBIDDEN`, `ACCOUNT_SUSPENDED` | Wrong role, not the owner, or a suspended account |
| 404 | `NOT_FOUND` | Unknown route or id |
| 409 | `CONFLICT` | The row or state does not allow the action |
| 413 | `PAYLOAD_TOO_LARGE` | Body over the limit |
| 429 | `RATE_LIMITED` | Rate limit, including sensitive routes such as OTP |
| 503 | `SERVICE_UNAVAILABLE` | A dependency is down |
| 500 | `INTERNAL_ERROR` | Anything else. The middleware logs it. The client gets a generic message |

Do not invent other status codes.

## Tests

`tests/unit` uses fakes and no database. `tests/integration` uses `TEST_DATABASE_URL` only. Insert fixtures with the test helpers, not by calling the endpoint under test. One request per test. Cover the service rules and one HTTP path. Keep line coverage at or above 80%.

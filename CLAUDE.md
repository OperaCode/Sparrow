# Sparrow

`client-app/` is the Expo customer app. `backend/` is the Express and Prisma API. Do not share code or a database client between them.

`backend/AGENTS.md` applies to the whole API. `client-app/AGENTS.md` applies to the whole app.

## Commerce

Groceries are a Sparrow catalogue. They are not a store marketplace.

- No store or vendor step on the grocery flow. Food vendors stay on the food flow only.
- A grocery product has no vendor. Sparrow owns the product, the price, and availability. Where the goods are bought is an operations decision and is not a customer choice or a stored vendor link.
- Goods cost is pass-through. The errand fee and the delivery fee are separate charges. Quotes and the order summary show goods, service, delivery, and total as distinct amounts.
- The API decides availability and every amount due. The app may preview a goods subtotal from catalogue prices. It must not submit a unit price, a fee, or a total.
- Money is whole naira. Copy goods and fees onto the order when it is priced. A later catalogue or fee change does not rewrite that order.

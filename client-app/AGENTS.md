# Client app

This is a production codebase. Code stays high quality and follows the rules and architecture below.

This package is Expo Router in `client-app/`. It is not a Next.js app. `app/` is the route tree. Business screens live in `pages/`.

`lib/mock.data.ts` and `lib/errand.catalog.ts` are stand-ins. New catalogue, price, and availability reads come from the API. Do not add production rules that exist only in those files.

## Grocery flow

The path is Errands, Groceries, category, catalogue, cart, delivery address, summary, submit.

- Do not add a store or vendor screen. Vendor fields on the errand cart are for food. A grocery cart leaves them unset.
- Show available products only. Adding, removing, and changing quantity updates the goods subtotal on the cart.
- Goods, service fee, delivery fee, and total are separate rows. The cart may preview the goods subtotal. Fees and the amount due come from the API quote, not from constants in `lib/pricing.ts`.
- Submit product ids, quantities, and the delivery address. Do not submit a unit price, a fee, or a total.

## Naming

Do not use single-letter names. Use a short name that says what the value is: `product`, `index`, `error`, not `p`, `i`, `e`.

Files and folders are lowercase `folder/name.type.tsx`.

- `pages/groceries/groceries.page.tsx`
- `pages/groceries/partials/category.list.tsx`
- `components/inputs/select.input.tsx`
- `lib/api.config.ts`
- `hooks/auth.hook.ts`
- `contexts/auth.context.tsx`

Common component types are `.input`, `.layout`, `.header`. Common page types are `.page`, `.list`, `.partial`, `.modal`, `.form`, `.card`. Shared types are `.config`, `.hook`, `.context`.

Route files in `app/` keep the URL segment. They do not use `name.type`.

## Folders

`app/` is routing and permission gates only. No business logic. A route file renders a page component.

`components/` is shared UI. Styles live here, using `colors`, `spacing`, `typography`, and `radius` from `constants/theme`. No business logic and no internal state. Behavior comes from props. Group them as `buttons`, `headers`, `inputs`, `texts`, and `containers`.

`hooks/` holds shared hooks. `contexts/` holds global contexts. `lib/` holds API clients and other services. `types/` holds shared types. `i18n/` holds `i18n.config` and translations when copy is translated.

`pages/{business}/` holds one business area. Areas do not import each other's internals.

- `{business}.page` initializes the main data and composes the screen. No styles. Layout comes from container components. Other handlers live in `partials/`.
- `partials/` holds a section of the page, or a small control with real logic. Share a lot of state through a context. Share a little through props.
- `shared/` holds pieces used by another business area.
- `hooks/` and `contexts/` inside the business folder stay private to that area.

```
pages/user-settings/user-settings.page.tsx
pages/user-settings/partials/edit-profile.form.tsx
pages/user-settings/partials/contact.card.tsx
pages/user-settings/partials/delete-account.button.tsx
```

## Code

Handle the negative case first and return. The rest of the function is the happy path, flat, with no extra indent. Do not use `else`, `else if`, or an `if` inside an `if`.

```ts
const validateOrder = (order: Order) => {
  if (!order.isValid) return { success: false, error: 'Invalid order' };
  if (!order.hasItems) return { success: false, error: 'Order has no items' };
  if (order.total <= 0) return { success: false, error: 'Invalid total' };
  return { success: true, order };
};
```

```ts
if (isAdmin) {
  open();
  return;
}
close();
```

Do not use `let`. Derive the value in a function and assign it with `const`.

```ts
const getPrice = (role: string) => {
  if (role === 'vip') return 1;
  if (role === 'default') return 2;
  return 0;
};

const price = getPrice(role);
```

Do not use `switch`. Use a map.

```ts
const roleDashboardMap = {
  admin: 'Admin Dashboard',
  user: 'User Dashboard',
  guest: 'Guest Dashboard',
} as const;

const getDashboard = (role: keyof typeof roleDashboardMap) => {
  return roleDashboardMap[role] ?? 'Unknown Role';
};
```

Do not use `any`. Leave the type off when it is inferred. Otherwise use the real type, a return type, or a generic `T`.

Do not add a check the types already guarantee. Do not fetch inside a loop. Load the records once and index them. Do not nest loops.

```ts
const productById = new Map(products.map((product) => [product.id, product]));
```

Wrap a `try/catch` only around the single call that can throw, in its own function, and report the error from that `catch` through one shared handler. Do not put `try/catch` in a component, a hook, or a service.

```ts
const safeGetUser = async (userId: string) => {
  try {
    return await getUser(userId);
  } catch (error) {
    reportError(error);
    return null;
  }
};
```

```tsx
const handleUpdateProfile = async () => {
  const result = await updateUserProfile(user);
  if (!result.success) return;
  setUserData(result.data);
};
```

Do not declare a component function inside another component. A small piece is its own component in the same file, above the parent. A large piece is its own file. Build its props before the `return`.

A long `StyleSheet.create` block means the component should be split.

```tsx
const UserCard = ({ user }: { user: User }) => {
  return (
    <CardContainer>
      <UserHeader user={user} />
      <UserActions user={user} />
    </CardContainer>
  );
};
```

Extract a component or function when a second caller needs the same behavior.

# Sparrow

Hyperlocal delivery and errand app built with React Native, using Expo and Expo Router. The API is a Node.js service in `backend/`.

## Project structure

```
client-app/       Expo app (React Native, Expo Router)
  app/            Screens and routes (file-based routing)
    (tabs)/       Customer bottom-tab screens
    (rider)/      Rider screens
    auth/         Phone, OTP and onboarding flow
    send/         Send-a-package flow
    errand/       Errand flow (food, groceries, custom requests)
    delivery/     Delivery detail
  components/     Reusable UI components
  contexts/       React context providers (auth, deliveries, drafts, cart, address book)
  lib/            Non-UI logic: pricing, geo helpers, catalog and mock data
  constants/      Design tokens (colors, spacing, typography, shadows)
  types/          Shared TypeScript types
  assets/         App icon and favicon
supabase/         Legacy schema migrations, kept for reference
backend/          Sparrow API (Node.js, Express, Prisma)
```

## Development

Mobile app:

```bash
cd client-app
npm install
npm run dev
```

API setup is in [backend/README.md](backend/README.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

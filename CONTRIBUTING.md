# Contributing to Sparrow

Thank you for contributing to Sparrow. This guide explains how to set up the project, how the code is organised and what a pull request needs before it can be merged.

## Getting started

Prerequisites:

- Node.js (LTS) and npm
- The Expo Go app on a device, or an Android/iOS simulator

```bash
git clone https://github.com/OperaCode/Sparrow.git
cd Sparrow
npm install
cp .env.example .env   # fill in values if the feature you're working on needs them
npm run dev
```

## Project structure

```
app/          Screens and routes (Expo Router, file-based routing)
  (tabs)/     Customer bottom-tab screens
  (rider)/    Rider screens
  auth/       Phone, OTP and onboarding flow
  send/       Send-a-package flow
  errand/     Errand flow (food, groceries, custom requests)
components/   Reusable UI components
contexts/     React context providers (auth, deliveries, drafts, cart, address book)
lib/          Non-UI logic: pricing, geo helpers, catalog and mock data
constants/    Design tokens (colors, spacing, typography, shadows)
types/        Shared TypeScript types
supabase/     Legacy schema migrations, kept for reference (see issue #24)
```

`lib/mockData.ts` is temporary demo data that powers the customer UI until the backend is integrated. Don't build new production logic on top of it.


## Workflow

1. **Start from an issue.** Pick an open issue, and comment on it so others know you're working on it.
2. **Branch from `main`** using `<type>/<issue-number>-<short-description>`, for example `feat/31-rider-earnings` or `fix/42-otp-resend`.
3. **Commit:**

   ```
   <type>(<scope>): <summary>
   ```

   Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`.
   Example: `fix(send): keep destination when going back from summary`

4. **Keep pull requests focused.** One issue per PR.

## Before opening a pull request

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] The app starts and the flows you changed work on at least one platform (Android, iOS or web)
- [ ] No secrets, debug logging or unused files are included

*Please ensure to never commit `.env` or any real keys or credentials, always 'gitignore' before push.*


In the PR description:

- Link the issue (`Closes #<number>`)
- Summarise what changed and why
- Add screenshots for UI changes where necessary
- Note anything you deliberately left out or deferred

**At least one maintainer review is required before merging.**

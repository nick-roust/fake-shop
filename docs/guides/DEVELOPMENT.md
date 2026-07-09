# Development Guide

## Purpose

Describe the local development workflow for fake-shop.

## Status

Active foundation.

## Development Commands

Install dependencies:

```bash
pnpm install
```

Start the local application:

```bash
pnpm run dev
```

Build the application:

```bash
pnpm run build
```

Run all tests:

```bash
pnpm run test
```

Run full validation before committing:

```bash
pnpm run check
pnpm run test
pnpm run build
```

## Project Structure Overview

Important source areas:

- `src/app/`: application routes and page entry points.
- `src/components/`: reusable UI and shell components.
- `src/features/`: user-facing feature flows.
- `src/domain/`: provider-neutral commerce domain concepts.
- `src/integrations/`: checkout adapter contracts and implementations.
- `src/storage/`: local demo storage boundary, repositories, and seed data.
- `src/config/`: public application configuration.
- `tests/`: unit, integration, end-to-end, and smoke tests.
- `docs/`: product, architecture, domain, guide, testing, and contribution documentation.

## Demo Data Workflow

Open the developer tools route after starting the application:

```text
http://localhost:3000/developer
```

Use this route to:

- load sample demo data;
- reset local demo data;
- inspect current local demo state;
- confirm selected adapter mode;
- inspect latest order and checkout session state.

Sample data is local-only and uses the existing storage boundary.

## Testing Commands

Run all tests:

```bash
pnpm run test
```

Run targeted test groups:

```bash
pnpm run test:unit
pnpm run test:integration
pnpm run test:e2e
pnpm run test:smoke
```

Validate demo foundation without starting the application:

```bash
pnpm run demo:check
```

Validate public local routes while the application is running:

```bash
pnpm run smoke:routes
```

The route smoke command uses `FAKE_SHOP_SMOKE_BASE_URL` when set and defaults to `http://127.0.0.1:3000`.

## Contribution Workflow

1. Read the relevant product, architecture, or domain documentation.
2. Keep changes bounded to one responsibility.
3. Update documentation when behavior, commands, configuration, or structure changes.
4. Run validation before committing.
5. Keep mock mode working without external services.

## Development Boundaries

- Domain code must not depend on storage drivers, UI, or integrations.
- UI components should not contain business logic.
- Feature services coordinate flows through domain functions and repository boundaries.
- Integrations own adapter-specific communication and mapping.
- Tests should validate public behavior and architecture boundaries.

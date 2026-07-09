# Smoke Tests

## Purpose

Describe smoke test flows for fake-shop.

## Status

Active foundation.

## Reproducible Demo Flows

Start the application:

```bash
pnpm run dev
```

Open:

```text
http://localhost:3000/developer
```

Load sample data and inspect:

- sample shop;
- products;
- checkout preparation;
- orders;
- integration settings.

## Smoke Commands

Run static demo foundation validation:

```bash
pnpm run demo:check
```

Run smoke test coverage:

```bash
pnpm run test:smoke
```

Run route smoke validation while the application is running:

```bash
pnpm run smoke:routes
```

The route smoke command uses only public local routes and does not depend on external services.

## Smoke Test Results

Smoke test results should be recorded in pull request or release validation notes.

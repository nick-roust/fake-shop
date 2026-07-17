# Configuration Guide

## Purpose

Describe fake-shop configuration for local development and checkout adapter experiments.

## Status

Active foundation.

## Public Configuration Principles

- The default local demo must work without external services.
- Mock mode is the default checkout mode.
- Configuration must use public terminology.
- No documentation or default configuration should require secrets.
- Optional external mode settings must stay separate from domain behavior.

## Environment Variables

Current local variables:

```text
FAKE_SHOP_MODE=mock
FAKE_SHOP_PUBLIC_URL=http://localhost:3000
FAKE_SHOP_SMOKE_BASE_URL=http://127.0.0.1:3000
```

See `.env.example` for the current example values.

## Docker Local Runtime

Docker Compose uses the existing public configuration semantics and defaults the local runtime to:

```text
FAKE_SHOP_MODE=mock
FAKE_SHOP_PUBLIC_URL=http://127.0.0.1:3000
```

Start it with:

```bash
docker compose up --build
```

No additional secrets, credentials, database, state volume, or external infrastructure are
required. Compose configuration does not override browser-local per-shop integration settings or
introduce new configuration precedence.

Docker packages the same application behavior. Shop, demo, checkout, and integration-setting state
remains in browser `localStorage`; it is not moved into the container or persisted by a server.

## Mock Mode

Mock mode is available by default. It supports local success, failure, and cancellation scenarios through the mock checkout adapter.

Mock mode does not require:

- external URLs;
- credentials;
- external services;
- production infrastructure.

## External Mode

External mode is optional. It prepares the adapter boundary for future external API experiments.

Current external mode behavior:

- selected per shop through integration settings;
- validates that public configuration fields are present;
- keeps request and response mapping inside the adapter boundary;
- does not call external services by default;
- does not store credentials.

## Smoke Configuration

Route smoke checks use:

```text
FAKE_SHOP_SMOKE_BASE_URL=http://127.0.0.1:3000
```

Run while the application is started:

```bash
pnpm run smoke:routes
```

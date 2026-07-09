# Development Guide

## Purpose

Describe the planned local development workflow for fake-shop.

## Status

Active foundation.

## Description

This guide covers the current local development workflow for the fake-shop foundation.

## Local Development Workflow

Install dependencies:

```bash
pnpm install
```

Start the local application:

```bash
pnpm run dev
```

Run validation before committing:

```bash
pnpm run check
pnpm run build
```

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

## Smoke Commands

Validate the demo foundation without starting the application:

```bash
pnpm run demo:check
```

Validate public local routes while the application is running:

```bash
pnpm run smoke:routes
```

The route smoke command uses `FAKE_SHOP_SMOKE_BASE_URL` when set and defaults to
`http://127.0.0.1:3000`.

## Project Conventions

Keep domain logic independent from UI, storage drivers, and integrations. Use repository
boundaries for local state access. Keep adapter diagnostics separate from domain state.

## Contribution Workflow

Use small bounded changes, run validation before commit, and update documentation when behavior
or developer workflow changes.

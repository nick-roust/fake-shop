# Smoke Tests

## Purpose

Describe planned smoke test documentation for fake-shop.

## Status

Active foundation.

## Description

This document defines the current foundation smoke checks used for local demo validation.

## Reproducible Demo Flows

Start the application:

```bash
pnpm run dev
```

Open:

```text
http://localhost:3000/developer
```

Load sample data and inspect the sample shop, products, checkout preparation, orders, and
integration settings routes.

## CI Validation

Run static validation:

```bash
pnpm run demo:check
```

Run route smoke validation while the application is running:

```bash
pnpm run smoke:routes
```

The smoke checks use only public local routes and do not depend on external services.

## Smoke Test Results

Smoke test results should be recorded in pull request or release validation notes.

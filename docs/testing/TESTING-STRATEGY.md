# Testing Strategy

## Purpose

Describe the planned testing strategy for fake-shop.

## Status

Active foundation.

## Description

This document defines the current testing philosophy, test boundaries, and validation approach.

## Testing Philosophy

Tests protect existing fake-shop behavior and architectural boundaries before additional v0.1 work
continues.

The foundation emphasizes:

- deterministic domain behavior;
- repository boundary usage;
- provider-neutral checkout status handling;
- reproducible local demo flows;
- no dependency on external services.

## Test Boundaries

Test groups:

- Unit tests cover domain calculations, checkout session transitions, and adapter contract behavior.
- Integration tests cover storage boundaries and feature service flows.
- End-to-end tests cover the main user journey through public application services.
- Smoke tests cover developer demo state and reproducible mock checkout behavior.

Tests must not introduce provider-specific assumptions, production infrastructure, or private
runtime concepts.

## Validation Approach

Run all tests:

```bash
pnpm run test
```

Run targeted groups:

```bash
pnpm run test:unit
pnpm run test:integration
pnpm run test:e2e
pnpm run test:smoke
```

Run full local validation:

```bash
pnpm run check
pnpm run test
pnpm run build
```

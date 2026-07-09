# Testing Strategy

## Purpose

Describe the testing strategy for fake-shop.

## Status

Active foundation.

## Testing Philosophy

Tests protect existing fake-shop behavior and architecture boundaries before additional v0.1 work continues.

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

Tests must not introduce provider-specific assumptions, production infrastructure, or unavailable runtime concepts.

## Test Commands

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

## Validation Approach

Run full local validation:

```bash
pnpm run check
pnpm run test
pnpm run build
```

Run route smoke validation while the application is running:

```bash
pnpm run smoke:routes
```

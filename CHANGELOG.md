# Changelog

All notable changes to fake-shop are documented in this file.

## fake-shop v0.1.0

Initial public release of fake-shop as an independent open-source reference commerce application.

### Included

- Shop management for creating, editing, viewing, and inspecting demo shops.
- Product catalog management with categories, prices, currencies, and active state.
- Cart and checkout preparation with product selection, quantities, totals, and customer information.
- Provider-neutral checkout session lifecycle with `created`, `pending`, `succeeded`, `failed`, and `cancelled` statuses.
- Default mock checkout adapter with success, failure, and cancellation scenarios.
- External checkout adapter boundary for future integration experiments.
- Order management with order list, order details, checkout status, adapter name, and diagnostics visibility.
- Shop-level integration settings for mock and external modes.
- Developer tools for sample data loading, reset, reseed, state inspection, and reproducible demo flows.
- Testing foundation with unit, integration, end-to-end, smoke, and route checks.
- GitHub Actions CI for pull requests and pushes to `main`.
- Public documentation for product scope, architecture, domain model, checkout model, project structure, configuration, integration, testing, and contribution workflows.

### Non Goals

- fake-shop is not a payment processor.
- fake-shop is not a banking system.
- fake-shop is not an accounting or settlement system.
- fake-shop is not a production ecommerce platform.
- fake-shop does not include provider-specific checkout integrations in v0.1.0.
- Docker support is not part of the v0.1.0 development requirement.

### Validation

The v0.1.0 release readiness checks include:

```bash
pnpm run check
pnpm run test
pnpm run build
pnpm run demo:check
pnpm run smoke:routes
pnpm audit --audit-level moderate
```

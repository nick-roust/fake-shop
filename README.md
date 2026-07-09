# fake-shop

fake-shop is an independent open-source reference commerce application for local demos and checkout integration experiments.

It provides a small but realistic commerce flow that developers can run locally, inspect, test, and extend without external infrastructure or production commerce setup.

## What It Includes

- shop management;
- product catalog management;
- cart and checkout preparation;
- customer information capture;
- order and checkout session visibility;
- default mock checkout adapter;
- external checkout adapter boundary for future experiments;
- local demo data, reset, and inspection tools;
- unit, integration, end-to-end, and smoke tests.

fake-shop is not a production ecommerce platform, payment processor, banking system, accounting system, or settlement system.

## Quick Start

Prerequisites:

- Node.js 20 or newer;
- pnpm 11 or newer.

Install dependencies:

```bash
pnpm install
```

Start the local application:

```bash
pnpm run dev
```

Open:

```text
http://localhost:3000
```

## First Demo

Open developer tools:

```text
http://localhost:3000/developer
```

Select `Load sample data`, then follow the demo links through:

- sample shop;
- products;
- checkout preparation;
- orders;
- integration settings.

Mock mode works by default and does not require external services.

## Checkout Model

fake-shop uses a provider-neutral checkout session lifecycle:

- `created`;
- `pending`;
- `succeeded`;
- `failed`;
- `cancelled`.

The mock checkout adapter supports success, failure, and cancellation scenarios. The external adapter boundary is present for future integration experiments, but it does not call external services by default.

## Development Commands

```bash
pnpm run check
pnpm run test
pnpm run build
```

Additional validation:

```bash
pnpm run demo:check
pnpm run smoke:routes
```

`pnpm run smoke:routes` expects the application to be running locally.

## Documentation

- [Documentation index](docs/README.md)
- [Getting Started](docs/guides/GETTING-STARTED.md)
- [Development Guide](docs/guides/DEVELOPMENT.md)
- [Configuration Guide](docs/guides/CONFIGURATION.md)
- [Integration Guide](docs/guides/INTEGRATION-GUIDE.md)
- [Testing Strategy](docs/testing/TESTING-STRATEGY.md)
- [Domain Model](docs/domain/DOMAIN-MODEL.md)
- [Checkout Model](docs/domain/CHECKOUT-MODEL.md)
- [Architecture](docs/architecture/FAKE-SHOP-ARCHITECTURE-v0.1.md)
- [Project Structure](docs/architecture/PROJECT-STRUCTURE.md)

## License

MIT

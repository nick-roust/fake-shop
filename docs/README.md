# Fake-Shop Documentation

## Purpose

Provide the entry point for fake-shop project documentation.

## Status

Active foundation.

## Project Overview

fake-shop is an independent open-source reference commerce application. It supports local demo usage, mock checkout flows, and external checkout adapter experiments through a provider-neutral architecture.

The project is designed for developers, integration engineers, and open-source contributors who need a small commerce application that can run without external infrastructure.

## Documentation Map

- [Product Requirements](product/FAKE-SHOP-PRODUCT-REQUIREMENTS-v0.1.md)
- [Architecture](architecture/FAKE-SHOP-ARCHITECTURE-v0.1.md)
- [Project Structure](architecture/PROJECT-STRUCTURE.md)
- [Domain Model](domain/DOMAIN-MODEL.md)
- [Checkout Model](domain/CHECKOUT-MODEL.md)
- [Getting Started](guides/GETTING-STARTED.md)
- [Development Guide](guides/DEVELOPMENT.md)
- [Configuration Guide](guides/CONFIGURATION.md)
- [Integration Guide](guides/INTEGRATION-GUIDE.md)
- [Testing Strategy](testing/TESTING-STRATEGY.md)
- [Smoke Tests](testing/SMOKE-TESTS.md)
- [Contributing](contributing/CONTRIBUTING.md)

## Historical Context

Legacy audit documents are retained in `docs/audit/` as historical planning context. They are not current architecture and should not be treated as implementation guidance.

## Quick Links

- Run locally: `pnpm run dev`
- Validate code and docs: `pnpm run check`
- Run tests: `pnpm run test`
- Load demo data: open `/developer` in the running application.

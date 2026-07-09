# Testing Documentation

## Purpose

Define the testing documentation area for fake-shop.

## Status

Active foundation.

## Testing Overview

fake-shop uses a local testing foundation built on the Node.js test runner and TypeScript transpilation for project source files.

Tests are grouped by responsibility:

- `tests/unit/`
- `tests/integration/`
- `tests/e2e/`
- `tests/smoke/`

## Testing Documents

- [Testing Strategy](TESTING-STRATEGY.md)
- [Smoke Tests](SMOKE-TESTS.md)

## Validation Boundaries

Tests should protect public project behavior and architecture boundaries. They should not depend on external services, unavailable infrastructure, or provider-specific behavior.

# Integration Guide

## Purpose

Describe fake-shop checkout integration boundaries and extension rules.

## Status

Active foundation.

## Adapter Concept

fake-shop keeps checkout execution behind a provider-neutral adapter boundary.

The application prepares:

- an Order;
- a Checkout Session;
- a generic Checkout Request.

The selected adapter returns a normalized Checkout Result.

The domain owns the visible checkout statuses:

- `created`;
- `pending`;
- `succeeded`;
- `failed`;
- `cancelled`.

Adapters must not replace these statuses with external status names.

## Mock Adapter

The mock checkout adapter is the default local adapter.

It supports:

- success;
- failure;
- cancellation.

It does not call external services and is suitable for local demos, tests, and smoke validation.

## External Adapter Boundary

The external adapter foundation proves that future external checkout implementations can use the same adapter contract as mock mode.

Current behavior:

- accepts a generic Checkout Request;
- prepares request mapping inside the adapter boundary;
- prepares response mapping inside the adapter boundary;
- returns a normalized Checkout Result;
- exposes diagnostics separately from domain state;
- does not call external services by default.

## Extension Rules

Future adapters must:

- use the existing checkout adapter contract;
- keep external request and response mapping inside `src/integrations/`;
- return provider-neutral checkout results;
- keep diagnostics separate from domain state;
- avoid changing domain entities for adapter-specific requirements;
- keep mock mode working without external services.

Future adapters must not:

- introduce provider-specific concepts into the domain model;
- require external services for local demo startup;
- store credentials in public configuration;
- bypass checkout session lifecycle rules.

# FAKE-SHOP PROJECT STRUCTURE v0.1

## 1. Purpose

The fake-shop project structure is defined before implementation so contributors have a shared map for where responsibilities belong.

Structure protects architecture boundaries by separating UI, application capabilities, domain concepts, integrations, storage, configuration, tests, scripts, and documentation. The goal is to prevent early implementation work from mixing responsibilities or coupling the domain model to external checkout behavior.

Contributors should use this document to understand repository organization before adding modules. New files and folders should fit an approved responsibility area, follow public commerce terminology, and preserve the provider-neutral architecture.

This document defines intended structure only. It does not create source folders, initialize packages, choose storage technology, define API routes, or define implementation details.

## 2. Repository Structure Principles

- clear ownership boundaries;
- domain separated from integrations;
- UI separated from business logic;
- adapters isolated;
- configuration isolated;
- tests separated from application behavior;
- documentation remains first-class.

Additional principles:

- fake-shop must remain local-first;
- external services must remain replaceable;
- provider-specific modules must not appear in the core structure;
- domain vocabulary must follow the approved domain model;
- checkout execution must pass through the adapter boundary;
- source structure must not bypass documented architecture layers.

## 3. High-Level Repository Layout

Target structure:

```text
src/
  app/
  components/
  features/
  domain/
  integrations/
  storage/
  config/
  lib/

tests/

scripts/

docs/
```

### `src/`

Responsibility:

- contains application source when implementation begins;
- groups source by architecture boundary;
- keeps product code separate from tests, scripts, and documentation.

### `src/app/`

Responsibility:

- application entry points;
- routing;
- page composition.

### `src/components/`

Responsibility:

- reusable UI components;
- design system components;
- shared presentational building blocks.

### `src/features/`

Responsibility:

- user-facing application capabilities;
- feature-level coordination for shops, products, checkout, orders, and integration settings.

### `src/domain/`

Responsibility:

- provider-neutral commerce concepts;
- domain vocabulary;
- business meaning and relationships.

### `src/integrations/`

Responsibility:

- external communication boundaries;
- checkout adapter implementations;
- mock and external mode integration behavior.

### `src/storage/`

Responsibility:

- persistence abstraction;
- local demo state;
- state access boundaries.

### `src/config/`

Responsibility:

- application configuration;
- environment handling;
- adapter configuration.

### `src/lib/`

Responsibility:

- shared technical utilities that do not belong to a product feature, domain entity, adapter, storage boundary, or configuration boundary.

### `tests/`

Responsibility:

- protect product behavior;
- validate architecture boundaries;
- keep test code separate from application behavior.

### `scripts/`

Responsibility:

- developer automation;
- demo scenarios;
- smoke execution.

### `docs/`

Responsibility:

- product requirements;
- architecture references;
- domain and checkout models;
- guides;
- testing documentation;
- contribution documentation;
- historical audit material.

## 4. Application Structure

### `app/`

Purpose:

- application entry points;
- routing;
- page composition.

Rules:

- app composition should call into features rather than own business logic;
- route-level code should not contain domain rules;
- page composition should not contain adapter implementation details.

### `components/`

Purpose:

- reusable UI components;
- design system components.

Rules:

- components should be reusable and presentation-focused;
- components should not own checkout execution;
- components should not access storage directly;
- components should not contain provider-specific behavior.

### `features/`

Purpose:

- user-facing application capabilities.

Expected feature areas:

- `shops`
- `products`
- `checkout`
- `orders`
- `integration-settings`

Rules:

- features coordinate UI behavior for a product capability;
- features may use domain concepts through application-level flow;
- features should not define domain vocabulary independently;
- features should not embed external communication logic.

## 5. Domain Structure

### `domain/`

Purpose:

- provider-neutral commerce concepts.

Expected areas:

- `shop/`
- `product/`
- `customer/`
- `cart/`
- `order/`
- `checkout/`

Rules:

- domain does not know adapters;
- domain does not know external services;
- domain vocabulary follows domain model.

Additional rules:

- domain concepts must be public commerce concepts;
- domain must not define provider-specific entities;
- domain must not perform external communication;
- domain must not choose storage technology;
- checkout status vocabulary must remain neutral.

## 6. Integration Structure

### `integrations/`

Purpose:

- external communication boundaries.

Expected areas:

- `checkout/`
- `mock/`
- `external/`
- `adapters/`

Rules:

- integrations depend on domain;
- domain does not depend on integrations;
- adapter logic stays isolated.

Additional rules:

- mock mode and external mode must use the same adapter boundary;
- provider-specific behavior must not leak into domain or UI structure;
- integrations may expose diagnostics for developer inspection;
- integrations must not own products, carts, orders, or checkout session rules.

## 7. Storage Structure

### `storage/`

Purpose:

- persistence abstraction;
- local demo state.

Rules:

- UI must not access storage directly;
- adapters must not own storage;
- storage technology remains replaceable.

Additional rules:

- storage should support local demo continuity;
- storage should preserve inspectable shops, products, orders, and checkout sessions according to product needs;
- storage should be accessed through application-level boundaries;
- storage must not define domain vocabulary independently.

## 8. Configuration Structure

### `config/`

Purpose:

- application configuration;
- environment handling;
- adapter configuration.

Rules:

- public configuration;
- no unavailable assumptions;
- secrets handled server-side.

Additional rules:

- mock mode must remain the default local path;
- external mode configuration must be optional;
- missing external configuration should not block mock mode;
- configuration names must use public terminology;
- configuration should not encode one external checkout provider as the default architecture.

## 9. Testing Structure

### `tests/`

Purpose:

- protect product behavior;
- validate boundaries.

Expected areas:

- `unit/`
- `integration/`
- `e2e/`
- `smoke/`

### `tests/unit/`

Responsibility:

- validate isolated domain behavior and small units of logic.

### `tests/integration/`

Responsibility:

- validate interactions between approved boundaries, such as features using domain behavior or checkout flows using adapters.

### `tests/e2e/`

Responsibility:

- validate user-facing flows across screens.

### `tests/smoke/`

Responsibility:

- validate reproducible demo flows and CI-ready startup behavior.

Rules:

- tests should protect public product behavior;
- tests should validate mock checkout by default;
- tests should not require unavailable services;
- tests should confirm adapter boundaries remain isolated.

## 10. Scripts Structure

### `scripts/`

Purpose:

- developer automation;
- demo scenarios;
- smoke execution.

Rules:

- scripts must use public flows;
- scripts must not encode unavailable services.

Additional rules:

- scripts should align with documentation;
- scripts should support local demo and smoke validation;
- scripts should not define product behavior independently;
- scripts should not bypass the adapter boundary.

## 11. Documentation Relationship

`docs/`, source code, and tests must evolve together.

Documentation defines the product and architecture boundaries before implementation. Source code implements those boundaries. Tests validate that behavior and boundaries remain intact.

Relationship rules:

- product changes require product documentation updates;
- architecture changes require architecture documentation updates;
- domain vocabulary changes require domain documentation updates;
- checkout lifecycle changes require checkout model updates;
- configuration changes require guide or reference updates;
- test expectation changes require testing documentation updates.

Implementation should not introduce undocumented modules, responsibilities, or integration paths.

## 12. Future Extension Rules

New modules must:

- have clear ownership;
- belong to one architectural layer;
- avoid duplicate responsibilities;
- not bypass existing boundaries.

Before adding a new module, contributors should confirm:

- which approved layer owns it;
- which domain or feature concept it supports;
- whether it duplicates an existing responsibility;
- whether it introduces external coupling;
- whether documentation needs to be updated first.

New modules must not introduce provider-specific concepts into the core domain, bypass adapter isolation, give UI direct storage access, or make external services required for the local demo path.

PROJECT STRUCTURE COMPLETE

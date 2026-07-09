# FAKE-SHOP PRODUCT REQUIREMENTS v0.1

## 1. Purpose

fake-shop is an independent open-source reference commerce application for demonstrating and testing checkout flows.

It exists to give developers a realistic but non-production shop they can run locally, inspect, modify, and connect to checkout backends. The project should make common commerce flows understandable without requiring unavailable platform knowledge, external infrastructure, or production ecommerce setup.

fake-shop is a reference application, not a payment processor or full commerce platform. Its purpose is to model enough shop, product, cart, order, and checkout behavior to support demos, integration experiments, and local development.

## 2. Product Vision

fake-shop should become a small, polished, open-source commerce reference app that external developers can use as a starting point for checkout experiments.

The application should demonstrate how a consumer shop can:

- manage sample shops and products;
- collect customer information;
- create carts and orders;
- start a provider-neutral checkout session;
- show checkout results;
- inspect order lifecycle state;
- switch between mock checkout mode and external integration mode.

The default experience must work locally without external services. External checkout integrations should be optional and configured through a clear adapter boundary.

## 3. Target Users

### Developers

Developers use fake-shop to run a local commerce app, understand checkout flow mechanics, and experiment with frontend and backend integration patterns.

They need:

- quick setup;
- readable codebase direction;
- realistic sample data;
- a working mock checkout flow;
- clear configuration for external backends.

### Integration Engineers

Integration engineers use fake-shop to test checkout scenarios, redirect handling, order state visibility, and adapter behavior.

They need:

- repeatable checkout scenarios;
- clear order and checkout status displays;
- configurable integration modes;
- a way to inspect request and response outcomes at a product level;
- predictable local behavior.

### Open-Source Contributors

Open-source contributors use fake-shop to improve reference flows, UI, adapters, documentation, and tests.

They need:

- public terminology;
- clear project boundaries;
- no external infrastructure dependency;
- a stable product direction;
- contribution areas that do not require unavailable project context.

## 4. Product Scope

### Shop Management

fake-shop must support creating and managing fake shops.

Required capabilities:

- create a fake shop;
- edit shop name, description, category, and display settings;
- view a list of shops;
- open shop details;
- configure shop-specific checkout behavior;
- select an integration mode for a shop.

Shop-specific checkout configuration should be understandable as public product behavior. It should not depend on unavailable identifiers, unavailable seed data, or hidden service assumptions.

Integration mode selection must include at least:

- mock mode;
- external API mode.

### Product Catalog

fake-shop must provide a sample product catalog for each shop.

Required capabilities:

- create sample products;
- edit product names;
- edit prices;
- assign categories;
- view product lists;
- choose products for cart/order creation.

The catalog is intended for demos and test orders. It is not a production inventory system.

### Cart and Checkout

fake-shop must support cart creation and checkout submission.

Required capabilities:

- create a cart from selected products;
- adjust item quantities;
- show order totals;
- collect customer information;
- submit checkout;
- show validation feedback for missing or invalid checkout information.

Customer information should include enough fields to test common checkout scenarios, such as name, email, phone, country, and address. Exact storage shape is outside v0.1 requirements.

### Order Management

fake-shop must provide order visibility.

Required capabilities:

- show an order list;
- show order details;
- show items, totals, customer summary, and checkout status;
- make checkout status changes visible after mock or external checkout attempts;
- preserve enough local state for a developer to inspect what happened during a demo session.

Order management in v0.1 is for local demo and integration visibility. It is not production order operations.

### Checkout Session

fake-shop must define a provider-neutral checkout session concept.

A checkout session represents one attempt to move an order through checkout. It must expose a simple status lifecycle:

- `created`: the checkout session has been initialized;
- `pending`: checkout has been submitted or is awaiting completion;
- `succeeded`: checkout completed successfully;
- `failed`: checkout completed with an error or rejection;
- `cancelled`: checkout was abandoned or intentionally cancelled.

The checkout session concept must be independent of any specific provider. Provider-specific responses may be displayed for debugging, but the product experience should always map them into the neutral status lifecycle.

### Integration Layer

fake-shop must include a configurable integration layer.

Required capabilities:

- configurable backend adapter;
- mock mode;
- external API mode.

The adapter boundary is a core product requirement.

The adapter boundary must allow fake-shop to keep its internal shop, cart, order, and checkout behavior separate from external backend details. The core application should create a provider-neutral checkout session request. The selected adapter decides how that request is handled.

Mock mode requirements:

- available by default;
- requires no external service;
- supports successful checkout;
- supports failed checkout;
- supports cancelled checkout;
- updates order and checkout session status visibly.

External API mode requirements:

- configurable by public environment variables or application settings;
- optional for local demo usage;
- able to submit checkout data to an external backend;
- able to surface external response information in a developer-friendly way;
- must not require external infrastructure.

## 5. User Flows

### Seller flow

Shop -> Products -> Order creation

Expected flow:

1. User opens the dashboard.
2. User creates or selects a fake shop.
3. User configures the shop checkout mode.
4. User creates or edits sample products.
5. User starts an order from selected products.
6. User reviews customer and checkout details.
7. User submits checkout.
8. User inspects the resulting order state.

### Buyer flow

Checkout -> Customer information -> Result

Expected flow:

1. Buyer-facing checkout page shows selected items and total.
2. User enters customer information.
3. User submits checkout.
4. User is routed through mock or external checkout behavior.
5. User lands on success, failure, or cancellation result page.
6. User can return to the shop or view order details.

### Developer flow

Clone -> Run -> Test mock mode -> Configure external adapter

Expected flow:

1. Developer clones the repository.
2. Developer installs dependencies.
3. Developer starts the application.
4. Developer creates a shop or uses sample shop data.
5. Developer creates products and an order.
6. Developer completes a mock checkout.
7. Developer inspects order and checkout session state.
8. Developer configures external API mode.
9. Developer repeats checkout and inspects adapter behavior.

## 6. UI Requirements

fake-shop must provide a modern application interface suitable for repeated developer use.

Required UI principles:

- modern application interface;
- shadcn/ui component system;
- dark and light theme support;
- responsive layout for desktop and mobile;
- clear navigation between setup, catalog, checkout, orders, and integration settings;
- concise empty states for first-run usage;
- visible checkout status and result states;
- developer-friendly inspection panels where useful.

Required screens:

- Dashboard
- Shops
- Shop details
- Products
- Checkout
- Orders
- Order details
- Integration settings

### Dashboard

The dashboard should summarize shops, recent orders, checkout status counts, and current integration mode.

### Shops

The shops screen should list fake shops and provide create/edit entry points.

### Shop details

The shop details screen should show shop settings, checkout configuration, products, and recent orders for the selected shop.

### Products

The products screen should support viewing, creating, and editing sample products and categories.

### Checkout

The checkout screen should show cart contents, totals, customer information fields, selected integration mode, and checkout submission controls.

### Orders

The orders screen should list created orders with status, amount, customer summary, and timestamps where available.

### Order details

The order details screen should show order contents, customer information summary, checkout session status, and relevant adapter result information.

### Integration settings

The integration settings screen should let users understand and select mock mode or external API mode, configure public adapter settings, and see setup guidance.

## 7. Configuration Requirements

fake-shop configuration must be public, minimal, and understandable.

Configuration principles:

- minimal environment variables;
- no external infrastructure dependency;
- mock mode available by default;
- external API mode is optional;
- configuration names must use public terminology;
- missing optional external configuration should not prevent mock mode from running;
- required configuration errors should be explicit and actionable.

The project should provide an example configuration file for public use. It should clearly distinguish default local behavior from optional external integration settings.

No v0.1 configuration may require unavailable hostnames, unavailable service identifiers, unavailable seed data, or workspace-specific paths.

## 8. Non Goals

fake-shop v0.1 explicitly does not include:

- payment processing;
- banking integration;
- accounting;
- settlement;
- inventory management;
- production ecommerce platform;
- authentication platform.

Additional non-goals:

- production-grade merchant operations;
- real money movement;
- provider certification;
- customer account management;
- warehouse workflows;
- tax calculation;
- fraud tooling.

## 9. Success Criteria

v0.1 is complete when a developer can:

- clone repository;
- start application;
- create a shop;
- create products;
- create an order;
- complete mock checkout;
- inspect order lifecycle;
- configure external adapter.

The completed v0.1 should also satisfy these product criteria:

- the app is understandable without unavailable platform knowledge;
- mock mode works without external services;
- public documentation explains setup and configuration;
- the adapter boundary is visible in product behavior;
- order and checkout session status can be inspected from the UI;
- no unavailable system concepts or dependencies appear in the product surface.

## 10. Future Extensions

Possible future directions:

- real checkout adapters;
- webhook processing;
- mobile clients;
- kiosk/POS scenarios.

PRODUCT REQUIREMENTS COMPLETE

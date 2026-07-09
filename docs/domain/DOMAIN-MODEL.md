# FAKE-SHOP DOMAIN MODEL v0.1

## 1. Purpose

The fake-shop domain model defines the shared commerce vocabulary used across product documentation, architecture, implementation, guides, and tests.

It exists to make core business concepts explicit before implementation. The domain model describes what each concept means, what it owns, how it relates to other concepts, and what it does not own.

Implementation must follow these domain boundaries. Code should not introduce new business concepts, ownership rules, or relationships that conflict with this model unless the domain documentation is updated first.

This document describes meaning and relationships only. It does not define database schemas, migrations, API contracts, provider payloads, or implementation details.

## 2. Domain Principles

- The commerce model is provider-neutral.
- Each domain concept has clear ownership.
- Commerce domain concepts are separate from integrations.
- The model stays simple enough for local-first reference usage.
- Domain entities use public commerce terminology.
- External checkout behavior is handled at the adapter boundary.
- Provider-specific concepts must not become core domain entities.
- Payment processing, settlement, banking, and accounting are outside the fake-shop domain.

## 3. Core Entities

### Shop

Purpose:

- Represents a fake storefront used for demos, local development, and checkout experiments.

Responsibilities:

- define storefront identity;
- group products;
- group orders;
- own shop-specific integration configuration;
- provide context for checkout behavior.

Owned concepts:

- shop name;
- shop description;
- shop category or scenario type;
- display settings;
- product catalog;
- order history;
- integration configuration.

Relationships:

- owns products;
- owns orders;
- owns integration configuration.

Exclusions:

- production merchant onboarding;
- legal merchant identity;
- production account management;
- settlement or accounting responsibility.

### Product

Purpose:

- Represents a sample item that can be selected for cart and order creation.

Responsibilities:

- describe a sellable sample item;
- provide editable price information for demos;
- belong to one shop;
- appear in carts and orders through item records.

Relationship to Shop:

- a product belongs to a shop;
- a shop owns its product catalog.

Relationship to Cart and Order:

- a product can appear in cart items while an order is being prepared;
- a product can be snapshotted into order items after order creation.

Exclusions:

- warehouse inventory;
- supplier management;
- fulfillment operations;
- production pricing rules.

### Category

Purpose:

- Groups products for organization and browsing.

Product grouping responsibility:

- provide a public label for product organization;
- help users browse or filter products in a fake shop.

Relationships:

- a category can group products within a shop;
- a product can be associated with a category.

Exclusions:

- complex merchandising strategy;
- inventory taxonomy;
- provider-specific classification.

### Customer

Purpose:

- Represents the checkout participant who provides information for an order.

Checkout participant role:

- supplies customer details during checkout;
- participates in orders;
- provides enough information to support checkout demos.

Contact information responsibility:

- name;
- email;
- phone;
- country;
- address fields when needed by a checkout flow.

Relationships:

- a customer participates in orders;
- an order belongs to a customer.

Exclusions:

- authentication;
- customer accounts;
- loyalty profiles;
- production identity verification.

### Cart

Purpose:

- Represents temporary order preparation before an order is submitted.

Temporary order preparation:

- holds selected products;
- holds selected quantities;
- supports total calculation;
- collects the contents that will become an order.

Relationship with Product:

- a cart contains cart items;
- each cart item refers to a selected product.

Exclusions:

- durable order history;
- production inventory reservation;
- payment authorization.

### Cart Item

Purpose:

- Represents one selected product line inside a cart.

Quantity and price responsibility:

- records selected quantity;
- records the current unit price used for cart calculation;
- contributes to cart total.

Relationships:

- belongs to a cart;
- refers to a product.

Exclusions:

- final order record keeping;
- fulfillment state;
- external checkout response data.

### Order

Purpose:

- Represents a submitted purchase request created from a cart.

Submitted purchase request:

- preserves selected items after checkout submission begins;
- provides a local record for order inspection;
- owns checkout session history for that purchase request.

Relationship with Shop:

- an order belongs to a shop;
- a shop owns orders created in that storefront.

Relationship with Customer:

- an order belongs to a customer;
- customer information provides checkout participant context.

Relationship with Checkout Session:

- an order has checkout sessions;
- checkout sessions represent attempts to complete checkout for the order.

Exclusions:

- production fulfillment;
- settlement;
- accounting;
- tax filing;
- customer support operations.

### Order Item

Purpose:

- Represents a product line captured inside an order.

Product snapshot responsibility:

- preserves product name, quantity, and price information at order creation time;
- allows order details to remain understandable even if the source product changes later.

Relationships:

- belongs to an order;
- originates from a cart item.

Exclusions:

- live product catalog editing;
- inventory deduction;
- fulfillment tracking.

### Checkout Session

Purpose:

- Represents one checkout attempt for an order.

Relationship with Order:

- belongs to an order;
- records the visible checkout outcome for that attempt.

Neutral checkout lifecycle responsibility:

- uses fake-shop neutral status vocabulary;
- records whether checkout was created, pending, succeeded, failed, or cancelled;
- may include adapter-facing diagnostic information without making provider-specific data part of the core domain.

Exclusions:

- payment processing;
- banking interaction;
- provider-specific lifecycle ownership;
- settlement.

### Integration Configuration

Purpose:

- Represents shop-level checkout integration selection.

Relationship with Shop:

- belongs to a shop;
- defines how that shop creates checkout sessions.

Mock/external mode selection responsibility:

- selects mock mode for local demo behavior;
- selects external mode for adapter-backed checkout experiments;
- provides configuration context without exposing adapter implementation details to domain entities.

Exclusions:

- provider-specific entity ownership;
- secret management policy;
- payment processing logic;
- external service lifecycle.

## 4. Entity Relationships

Shop:

- owns products;
- owns orders;
- owns integration configuration.

Product:

- belongs to shop;
- can appear in cart items.

Customer:

- participates in orders.

Cart:

- contains cart items.

Cart Item:

- belongs to cart;
- refers to product;
- carries quantity and current cart price.

Order:

- created from cart;
- contains order items;
- belongs to shop;
- belongs to customer;
- has checkout sessions.

Order Item:

- belongs to order;
- represents a product snapshot from cart item data.

Checkout Session:

- belongs to order;
- executed through adapter boundary.

Integration Configuration:

- belongs to shop;
- selects mock or external checkout mode.

## 5. Domain Boundaries

In scope:

- fake storefront concepts;
- catalog;
- cart;
- customer;
- order;
- checkout session.

Out of scope:

- payment processing;
- banking;
- accounting;
- settlement;
- inventory;
- production merchant operations.

The domain owns commerce meaning and relationships. It does not own external checkout implementation, provider-specific payloads, network calls, payment authorization, or production operations.

## 6. Status Vocabulary

fake-shop uses neutral statuses so the application can stay independent of any external checkout provider.

Order status examples:

- `created`: order has been created from a cart;
- `pending`: order is awaiting checkout outcome;
- `completed`: order checkout has completed successfully;
- `cancelled`: order was cancelled or abandoned.

Checkout Session status:

- `created`: checkout session has been initialized;
- `pending`: checkout has been submitted or is awaiting completion;
- `succeeded`: checkout completed successfully;
- `failed`: checkout completed with an error or rejection;
- `cancelled`: checkout was abandoned or intentionally cancelled.

Provider-specific statuses are mapped into neutral fake-shop statuses at the adapter boundary. Provider-specific status names must not replace the fake-shop status vocabulary in the core domain.

## 7. Integration Boundary Relationship

Domain entities do not know adapter implementation details.

The domain flow is:

```text
Domain Order
to
Checkout Adapter
to
Checkout Session Result
```

The order provides the commerce context. The checkout adapter handles mock or external checkout behavior. The checkout session result returns neutral status information that fake-shop can display and store according to domain boundaries.

Domain entities must not depend on external backend payloads, credentials, transport details, or provider-specific lifecycle rules.

## 8. Future Extension Rules

New entities must:

- have clear ownership;
- not duplicate existing concepts;
- not introduce provider-specific concepts into domain.

Before adding a new domain entity, the project should confirm:

- the concept is part of fake-shop commerce behavior;
- the concept cannot be represented by an existing entity;
- the concept has clear relationships;
- the concept does not belong to an adapter or external integration;
- the concept does not introduce payment processing, banking, accounting, settlement, inventory, or production merchant operations into the core domain.

DOMAIN MODEL COMPLETE

# FAKE-SHOP ARCHITECTURE v0.1

## 1. Architecture Purpose

fake-shop is an independent open-source commerce reference application. Its architecture exists to support local demos, checkout experiments, and contribution by developers who do not have unavailable system knowledge.

The application must be local-first. A developer should be able to clone the repository, start the app, create sample commerce data, complete mock checkout, and inspect order state without connecting to any external service.

The checkout architecture must be provider-neutral. fake-shop should model shop, product, cart, order, customer, and checkout session behavior in its own public domain language. External checkout systems are integrations at the edge of the application, not the center of the architecture.

The legacy project is background research only. It does not define this architecture.

## 2. Architecture Principles

- Product boundaries before implementation.
- Domain logic separated from integrations.
- Mock mode and external mode share the same adapter boundary.
- External services are replaceable.
- Local demo must work without external infrastructure.
- Public terminology is required across code, documentation, UI, and configuration.
- Provider-specific details must not leak into core shop, cart, order, or checkout concepts.
- The default path must be simple enough for first-time contributors to understand.
- Architecture should favor clear modules over premature framework complexity.

## 3. High-Level Architecture

fake-shop is organized around these main layers:

1. UI layer
2. Application layer
3. Commerce domain layer
4. Checkout adapter layer
5. State and storage layer
6. Configuration layer
7. Test and demo tooling layer

### UI Layer

The UI layer presents the product experience.

Responsibilities:

- render the dashboard;
- manage navigation across shops, products, checkout, orders, and integration settings;
- collect user input;
- show validation feedback;
- display checkout session status;
- provide developer-friendly inspection views;
- support dark and light themes;
- support responsive layouts.

The UI layer should use shadcn/ui as the component foundation. It should consume application actions and view models rather than embedding checkout provider behavior directly in screens.

Required screens:

- Dashboard
- Shops
- Shop details
- Products
- Checkout
- Orders
- Order details
- Integration settings

### Application Layer

The application layer coordinates product use cases.

Responsibilities:

- create and update shops;
- create and update products;
- build carts from products;
- collect customer information;
- create orders;
- create checkout sessions;
- route checkout attempts through the selected adapter;
- update visible order and checkout session state;
- prepare data for UI screens.

The application layer owns flow coordination. It should not contain provider-specific request formats, provider credentials, or provider-specific status names.

### Commerce Domain Layer

The commerce domain layer owns provider-neutral commerce concepts.

Core concepts:

- Shop
- Product
- Category
- Cart
- Customer
- Order
- Checkout session
- Integration mode

The architecture does not define database schemas in v0.1. These concepts describe product boundaries and module ownership, not migration files or storage tables.

Domain rules:

- orders are created from cart contents and customer information;
- order totals are calculated from item quantity and unit amount;
- checkout sessions belong to orders;
- checkout session status uses the neutral lifecycle: `created`, `pending`, `succeeded`, `failed`, `cancelled`;
- money handling must be explicit and validated;
- external provider responses may be attached for inspection but must not replace neutral fake-shop status.

### Checkout Adapter Layer

The checkout adapter layer is the core architectural boundary.

Responsibilities:

- receive provider-neutral checkout session input from the application layer;
- perform mock checkout behavior or call a configured external backend;
- return a provider-neutral checkout session result;
- map external results into fake-shop statuses;
- expose adapter diagnostics in a developer-friendly form.

All checkout modes must use the same adapter boundary:

- mock mode;
- external API mode;
- future provider adapters.

Mock mode is the default adapter and must not require external services.

External API mode is optional and replaceable. It must be configured through public settings and must not force the rest of fake-shop to adopt one provider's model.

### State and Storage Layer

The state and storage layer supports local demo continuity and product inspection.

Responsibilities:

- keep shops available during a local demo session;
- keep products available during a local demo session;
- keep orders and checkout sessions inspectable;
- support reset or reseed behavior for demos;
- avoid hidden dependencies on unavailable data.

v0.1 architecture does not require a specific database. The implementation may choose simple local storage, file-backed storage, an embedded database, or another lightweight option if it preserves the local-first product goal.

Storage decisions must remain behind application-level access patterns so that UI and checkout adapters do not depend on a specific persistence technology.

### Configuration Layer

The configuration layer owns public setup behavior.

Responsibilities:

- select mock mode or external API mode;
- provide default local configuration;
- validate required external integration settings only when external mode is selected;
- expose clear setup errors;
- avoid unavailable hostnames, unavailable identifiers, and workspace-specific assumptions.

Configuration must be minimal. Mock mode must start without user-provided secrets or external URLs.

### Test and Demo Tooling Layer

The test and demo tooling layer supports repeatable public usage.

Responsibilities:

- provide sample data for shops and products;
- support a smoke path for mock checkout;
- support result-page verification;
- support external adapter verification without making it mandatory;
- keep scripts aligned with public documentation.

Tooling must test fake-shop behavior and adapter boundaries. It must not encode one external provider as the architectural source of truth.

## 4. Domain Boundaries

### Shop Boundary

The shop boundary owns fake storefront identity and checkout configuration.

Included:

- shop name and description;
- shop category or scenario type;
- display settings;
- selected integration mode;
- link to products and orders.

Excluded:

- merchant onboarding;
- legal merchant identity;
- production account management.

### Product Catalog Boundary

The product catalog boundary owns sample products and categories.

Included:

- product names;
- descriptions;
- categories;
- editable prices;
- active or inactive sample products.

Excluded:

- warehouse inventory;
- fulfillment operations;
- supplier management.

### Cart and Checkout Boundary

The cart and checkout boundary owns customer-facing order preparation.

Included:

- selected products;
- quantities;
- totals;
- customer information;
- checkout submission;
- result page routing.

Excluded:

- real payment authorization;
- fraud screening;
- bank or card network behavior.

### Order Boundary

The order boundary owns local order visibility.

Included:

- order list;
- order details;
- customer summary;
- order totals;
- checkout session status;
- adapter diagnostics where useful.

Excluded:

- settlement;
- accounting;
- tax filing;
- production support workflows.

### Integration Boundary

The integration boundary owns communication with checkout backends.

Included:

- adapter selection;
- mock adapter;
- external API adapter;
- provider-neutral result mapping;
- optional response inspection.

Excluded:

- provider-specific business ownership;
- provider dashboards;
- one-provider-only architecture.

## 5. Checkout Adapter Architecture

The checkout adapter is the main extension point.

Conceptual adapter responsibilities:

- accept a checkout request created from fake-shop order data;
- return a checkout session result;
- provide a neutral status;
- optionally provide a redirect target;
- optionally provide diagnostic metadata for inspection;
- report actionable errors.

Adapter rules:

- adapters must not mutate core domain concepts directly;
- adapters must not require UI-specific behavior;
- adapters must not expose provider-only status as the primary application status;
- adapters must be replaceable without rewriting shop, product, cart, or order features.

### Mock Adapter

The mock adapter is required for v0.1.

Responsibilities:

- create a checkout session without network access;
- simulate success;
- simulate failure;
- simulate cancellation;
- update status in a predictable way;
- support demos and smoke checks.

The mock adapter is the default path for new users.

### External API Adapter

The external API adapter is required as an architectural capability for v0.1.

Responsibilities:

- send checkout data to a configured backend;
- map backend responses into neutral fake-shop checkout status;
- surface response information for developers;
- fail with clear configuration and connectivity errors.

The external API adapter must not define the entire app architecture. It is one adapter behind the same boundary as mock mode.

### Future Adapters

Future adapters may support specific checkout providers. They must follow the same adapter boundary and keep provider-specific behavior isolated.

## 6. Application Flow Architecture

### Seller Flow

Shop -> Products -> Order creation

Flow ownership:

- UI layer collects shop and product input.
- Application layer coordinates creation and updates.
- Commerce domain layer applies basic commerce rules.
- State and storage layer preserves local demo state.

### Buyer Flow

Checkout -> Customer information -> Result

Flow ownership:

- UI layer presents checkout and result screens.
- Application layer creates an order and checkout session.
- Checkout adapter layer performs mock or external checkout.
- Order boundary displays final visible status.

### Developer Flow

Clone -> Run -> Test mock mode -> Configure external adapter

Flow ownership:

- Configuration layer defaults to mock mode.
- Test and demo tooling provides reproducible sample behavior.
- Integration settings expose optional external configuration.
- Checkout adapter layer lets developers compare mock and external behavior through the same product flow.

## 7. UI Architecture

The UI should be a modern application interface, not a marketing page.

Navigation should make the main product areas obvious:

- Dashboard
- Shops
- Products
- Checkout
- Orders
- Integration settings

UI composition rules:

- screens should be organized around user tasks;
- checkout state should be visible wherever it affects user decisions;
- inspection panels should be useful but not dominate buyer-facing views;
- dark and light theme support should be consistent;
- mobile layouts must preserve checkout usability;
- status labels must use the neutral checkout lifecycle.

The UI must not hard-code provider-specific behavior into screen structure. Provider-specific information, when present, belongs in adapter result or diagnostics areas.

## 8. Configuration Architecture

Configuration must support local-first usage and optional external integration.

Configuration principles:

- mock mode is the default;
- environment variables should be minimal;
- external settings are required only when external mode is selected;
- configuration errors must explain what is missing and how to fix it;
- public example configuration must be maintained;
- secrets, if introduced by future adapters, must never be required for mock mode.

The architecture should distinguish:

- app-level public URL settings;
- selected integration mode;
- optional external API URL;
- optional external adapter credentials;
- sample data or demo seed behavior.

These are categories, not detailed environment variable contracts.

## 9. State Management Architecture

v0.1 should use the simplest state approach that supports:

- local demo use;
- visible order lifecycle inspection;
- reset or reseed behavior;
- predictable tests;
- future replacement without changing product boundaries.

State ownership must follow product boundaries:

- shop state belongs to shop management;
- product state belongs to product catalog;
- cart state belongs to checkout preparation;
- order and checkout session state belongs to order management;
- adapter diagnostics belong to integration behavior.

The architecture does not require a production database or durable multi-user storage in v0.1.

## 10. Testing Architecture

Testing should protect product behavior and adapter boundaries.

Required testing focus:

- app starts in mock mode;
- sample shop and product flows work;
- cart totals are correct;
- required customer fields are validated;
- checkout session can be created;
- mock checkout can succeed, fail, and cancel;
- order details show the resulting status;
- external API mode reports missing configuration clearly;
- adapter-specific behavior remains isolated.

Smoke tooling should follow public developer flows:

- create or load sample data;
- create an order;
- run mock checkout;
- inspect the result.

Tests must not depend on unavailable services.

## 11. Non-Goals

The architecture does not include:

- payment processing;
- banking integration;
- accounting;
- settlement;
- inventory management;
- production ecommerce platform behavior;
- authentication platform behavior;
- detailed API schemas;
- database migrations;
- provider-specific checkout ownership;
- unavailable infrastructure dependency.

## 12. Architecture Acceptance Criteria

The v0.1 architecture is acceptable when:

- fake-shop can run in mock mode without external services;
- shop, product, cart, order, and checkout session concepts are provider-neutral;
- mock mode and external API mode use the same adapter boundary;
- external services can be replaced without redesigning the core app;
- UI screens map to product requirements;
- configuration is public and minimal;
- no unavailable system concepts appear in the architecture;
- implementation teams can start building without copying the legacy architecture.

ARCHITECTURE COMPLETE

# FAKE-SHOP CHECKOUT MODEL v0.1

## 1. Purpose

The fake-shop checkout model defines how fake-shop moves from an order to a checkout result.

It exists to describe the relationship between an Order and a Checkout Session. An Order represents a submitted purchase request. A Checkout Session represents one attempt to complete checkout for that order.

The checkout model is provider-neutral. It defines fake-shop concepts, lifecycle, status transitions,
adapter interaction, and mock behavior without depending on a specific checkout provider.

This document describes checkout meaning and flow. The implementation uses a Promise-based adapter
contract and browser-local storage; neither is a trusted payment ledger.

## 2. Checkout Principles

- Order represents purchase request.
- Checkout Session represents checkout attempt.
- Adapter performs or simulates checkout execution.
- fake-shop owns visible checkout lifecycle.
- External systems remain replaceable.
- Mock mode and external API mode use the same checkout boundary.
- Provider-specific behavior stays outside the domain model.
- Checkout status uses fake-shop neutral vocabulary.

## 3. Checkout Concepts

### Checkout Request

Purpose:

- input created from order data.

Description:

- A Checkout Request is the provider-neutral information prepared from an Order for checkout execution.
- It gives the selected adapter enough commerce context to run mock or external checkout behavior.
- It is not a provider-specific payload and must not define a detailed API contract.

### Checkout Session

Purpose:

- represents one checkout attempt.

Description:

- A Checkout Session belongs to an Order.
- It records the visible status of a checkout attempt.
- An Order may have one or more checkout sessions over time if checkout is retried or repeated during a demo.

### Checkout Adapter

Purpose:

- executes mock or external checkout behavior.

Description:

- A Checkout Adapter receives checkout input from fake-shop and asynchronously returns a normalized
  completed, pending, or unsupported result.
- The adapter boundary keeps domain entities separate from external communication and provider-specific details.
- Mock mode and external API mode both use this boundary.

### Checkout Result

Purpose:

- represents normalized checkout outcome.

Description:

- A completed Checkout Result reports a normalized outcome; a pending result may contain generic
  navigation and recovery data.
- It may include developer-facing diagnostics.
- It must not replace fake-shop status with provider-specific status names.

## 4. Checkout Lifecycle

The checkout lifecycle follows this sequence:

```text
Order created
↓
Checkout Session created
↓
Checkout started
↓
Adapter selected
↓
Checkout execution
↓
Completed result or pending recovery information received
↓
Checkout Session updated
↓
Order status updated
```

### Order created

An Order is created from cart contents and customer information. It represents the submitted purchase request that will be used for checkout.

### Checkout Session created

A Checkout Session is created for the Order. Its initial status is `created`.

### Checkout started

Checkout begins for the session. The session moves toward `pending` while fake-shop prepares to execute checkout through the selected adapter.

### Adapter selected

fake-shop selects the adapter based on the shop integration configuration. The adapter may be mock mode or external API mode.

### Checkout execution

The selected adapter performs checkout execution. Mock mode performs local simulated behavior.
External mode is currently unsupported and makes no external call.

### Result received

The adapter returns a Checkout Result using fake-shop neutral status vocabulary.

### Checkout Session updated

The Checkout Session records the normalized result. Its status becomes `succeeded`, `failed`, or `cancelled`, or remains `pending` if checkout is still awaiting a result.

### Order status updated

The Order status is updated for visibility. The Order remains inspectable regardless of checkout outcome.

## 5. Checkout Session Status Model

### `created`

Meaning:

- checkout session initialized.

Typical transition:

- `created` to `pending` when checkout starts.

### `pending`

Meaning:

- checkout started and waiting for result.

Typical transitions:

- `pending` to `succeeded` when checkout completes successfully;
- `pending` to `failed` when checkout completes with an error or rejection;
- `pending` to `cancelled` when checkout is abandoned or cancelled.

### `succeeded`

Meaning:

- checkout completed successfully.

Typical transition:

- terminal status for a successful checkout session.

### `failed`

Meaning:

- checkout completed with error or rejection.

Typical transition:

- terminal status for a failed checkout session.

### `cancelled`

Meaning:

- checkout was abandoned or cancelled.

Typical transition:

- terminal status for a cancelled checkout session.

### Status Transition Rules

- A new Checkout Session starts as `created`.
- A Checkout Session becomes `pending` when checkout execution begins.
- A `pending` session may become `succeeded`, `failed`, or `cancelled`.
- Terminal statuses should remain visible for inspection.
- Provider-specific statuses are mapped into these neutral statuses at the adapter boundary.

## 6. Mock Checkout Flow

Purpose:

- default local experience.

Flow:

```text
Create order
↓
Create checkout session
↓
Run mock adapter
↓
Choose result:
success
failure
cancel
↓
Update checkout session
↓
Update order visibility
```

Rules:

- no external dependency;
- reproducible;
- developer friendly.

Mock checkout must allow fake-shop to demonstrate the full checkout lifecycle locally. It should support success, failure, and cancellation outcomes without requiring external services.

## 7. External Checkout Flow

Purpose:

- optional integration mode.

Flow:

```text
Create order
↓
Create checkout session
↓
Select external mode
↓
Report unsupported without changing checkout session
```

Rules:

- external provider behavior stays inside adapter;
- domain remains unchanged.

External mode is currently an integration placeholder. The external adapter reports unsupported and
does not execute a call. Configuration alone never creates pending state, an external reference, or a
redirect. A simulated redirect adapter demonstrates asynchronous recovery locally and labels its
result as simulated; it does not process or verify payment.

## 8. Adapter Boundary

Domain:

- Order
- Checkout Session

communicate with:

- Checkout Adapter

Adapter responsibilities:

- adapter-owned external communication when implemented;
- response mapping;
- diagnostics.

Adapter must not:

- own orders;
- own products;
- change domain rules;
- define fake-shop statuses.

The adapter boundary keeps checkout execution replaceable. The domain provides the commerce context, and the adapter returns a normalized result.

An uncertain initiation exception leaves the session pending with diagnostics. fake-shop does not
retry it automatically or turn it into a failed payment. A browser return only locates a stored
session; query parameters and local UI state cannot confirm an external outcome. Adapter-reported
results are not cryptographically verified by fake-shop.

## 9. Result Handling

### Success result

- checkout session succeeded;
- order becomes visible as completed.

### Failure result

- checkout session failed;
- order remains visible with failure information.

### Cancelled result

- checkout session cancelled;
- order remains inspectable.

All results must remain visible for developer inspection. A failed or cancelled checkout does not remove the Order from fake-shop.

## 10. Developer Inspection Model

Developers should be able to inspect:

- order;
- checkout session;
- selected adapter;
- checkout status;
- adapter diagnostics.

Inspection should make checkout behavior understandable without exposing provider-specific concepts as domain concepts. Adapter diagnostics may explain external behavior, but fake-shop status remains neutral.

## 11. Non Goals

The checkout model does not include:

- payment processing;
- banking;
- accounting;
- settlement;
- provider ownership;
- production transaction management.

The checkout model also does not define provider-specific integrations, provider payloads, API contracts, database schemas, or production financial behavior.

## 12. Future Extensions

Possible future extensions:

- webhook support;
- additional adapters;
- mobile checkout;
- kiosk checkout.

CHECKOUT MODEL COMPLETE

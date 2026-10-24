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

The selected adapter returns a Promise of a normalized result. The result is either completed with a
neutral terminal status, pending with optional navigation/recovery data, or unsupported.

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

The current external adapter is an honest placeholder. It reports unsupported and makes no call;
configuration alone never creates a pending attempt, reference, or redirect.

## Adding an Adapter

Implement `CheckoutAdapter<Scenario>` in `src/integrations/checkout/`. `execute` is asynchronous and
receives a provider-neutral order/session request. It returns one of:

- `kind: "completed"` with `succeeded`, `failed`, or `cancelled` and diagnostic provenance;
- `kind: "pending"` with optional generic `redirectUrl` and `externalReference`;
- `kind: "unsupported"` when initiation is unavailable.

For a pending initiation, fake-shop persists the pending session before awaiting `execute`, then
persists the adapter identity, result provenance, and recovery metadata before navigation. The
adapter may implement optional `reconcile({ request, recoveryInfo })` to look up an attempt. It may
return completed, still pending, or unsupported. An exception is recorded as a recoverable pending
diagnostic. Reconciliation must obtain its result through the adapter's own integration mechanism;
it must not treat a browser return URL, query parameter, or local UI choice as confirmation. fake-shop
binds the attempt to its original adapter ID and configuration snapshot so changed settings do not
reroute recovery.

Pass safe, non-secret adapter configuration explicitly when starting an attempt. fake-shop snapshots
those string values with the session and sends that same snapshot to initiation and reconciliation.
Do not pass credentials, private keys, or other secrets: browser-local storage is visible and is not
secure credential custody.

Minimal shape:

```ts
const exampleAdapter: CheckoutAdapter<"start"> = {
  id: "example-checkout",
  name: "Example checkout",
  async execute({ order, session, configuration }, scenario) {
    const initiation = await beginCheckout({ order, session, configuration });
    return {
      kind: "pending",
      redirectUrl: initiation.redirectUrl,
      externalReference: initiation.reference,
      diagnostics: {
        adapterId: "example-checkout",
        adapterName: "Example checkout",
        scenario,
        message: "Checkout is pending.",
        executedAt: new Date().toISOString(),
        provenance: "adapter-reported",
      },
    };
  },
  async reconcile({ request, recoveryInfo }) {
    const outcome = await lookUpAttempt({
      sessionId: request.session.id,
      externalReference: recoveryInfo.externalReference,
      configuration: request.configuration,
    });
    if (outcome.kind === "pending") {
      return {
        kind: "pending",
        externalReference: recoveryInfo.externalReference,
        diagnostics: {
          adapterId: "example-checkout",
          adapterName: "Example checkout",
          scenario: "return-reconciliation",
          message: "The attempt is still pending.",
          executedAt: new Date().toISOString(),
          provenance: "adapter-reported",
        },
      };
    }
    if (outcome.kind === "unsupported") {
      return {
        kind: "unsupported",
        diagnostics: {
          adapterId: "example-checkout",
          adapterName: "Example checkout",
          scenario: "return-reconciliation",
          message: "This attempt cannot currently be reconciled.",
          executedAt: new Date().toISOString(),
          provenance: "adapter-reported",
        },
      };
    }
    return {
      kind: "completed",
      status: outcome.status,
      externalReference: recoveryInfo.externalReference,
      diagnostics: {
        adapterId: "example-checkout",
        adapterName: "Example checkout",
        scenario: "return-reconciliation",
        message: "Outcome reported by the adapter.",
        executedAt: new Date().toISOString(),
        provenance: "adapter-reported",
      },
    };
  },
};

await startCheckoutWithAdapter(session, exampleAdapter, "start", {
  publicShopLabel: "Demo shop",
});
```

`beginCheckout` and `lookUpAttempt` above are illustrative adapter-owned operations, not fake-shop
APIs. Validate redirect destinations before navigating. A safe destination is navigation data only;
it does not establish a result. Do not store credentials in the session configuration snapshot.

The included `simulated-redirect-checkout` exists only to demonstrate delayed initiation, reload, and
return recovery. Its explicit return action reports `simulated` provenance and is not a payment.
Manual status controls are also labeled and recorded as simulated local actions. They cannot override
an adapter-bound pending attempt or a newer stored session state.
Mock checkout remains local and immediate. Existing browser-local storage is a demo convenience, not
a trusted payment ledger. Adapter-reported outcomes are normalized integration reports and are not
cryptographically verified by fake-shop.
The repository uses a single-tab in-memory store layered over browser storage; it does not provide
cross-tab locking or server-side concurrency control.

## Extension Rules

Future adapters must:

- use the existing checkout adapter contract;
- keep external request and response mapping inside `src/integrations/`;
- return provider-neutral checkout results;
- keep diagnostics separate from domain state;
- avoid changing domain entities for adapter-specific requirements;
- keep mock mode working without external services.
- make provenance clear and never claim browser navigation independently verifies payment.

Future adapters must not:

- introduce provider-specific concepts into the domain model;
- require external services for local demo startup;
- store credentials in public configuration;
- bypass checkout session lifecycle rules.

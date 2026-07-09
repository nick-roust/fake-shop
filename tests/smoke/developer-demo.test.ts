import assert from "node:assert/strict";
import test from "node:test";

import {
  inspectDeveloperState,
  loadSampleDemoState,
} from "../../src/features/developer-experience/developer-experience-service";
import { runMockCheckout } from "../../src/features/checkout/checkout-service";
import { createCheckoutSessionForOrder } from "../../src/domain/checkout";
import {
  getLocalDemoRepositories,
  resetLocalDemoState,
} from "../../src/storage/local-demo-boundary";

test("developer demo data loads a reproducible local state", () => {
  resetLocalDemoState();

  const summary = loadSampleDemoState();

  assert.equal(summary.sampleShopId, "sample-market");
  assert.equal(summary.counts.shops, 2);
  assert.equal(summary.counts.products, 4);
  assert.deepEqual(summary.checkoutScenarios, ["success", "failure", "cancelled"]);
  assert.equal(inspectDeveloperState().integrationModes[0]?.mode, "mock");
});

test("mock checkout can complete from demo data through public services", () => {
  resetLocalDemoState();
  loadSampleDemoState();

  const repositories = getLocalDemoRepositories();
  const order = repositories.orders.getById("sample-order-failure");

  assert.ok(order);

  const session = repositories.checkoutSessions.save(
    createCheckoutSessionForOrder("sample-smoke-session", order)
  );
  const execution = runMockCheckout(session, "success");

  assert.equal(execution.status, "succeeded");
  assert.equal(execution.order.status, "completed");
});

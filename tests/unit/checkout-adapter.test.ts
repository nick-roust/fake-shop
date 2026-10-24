import assert from "node:assert/strict";
import test from "node:test";

import {
  externalCheckoutAdapter,
  mockCheckoutAdapter,
  type MockCheckoutScenario,
} from "../../src/integrations/checkout";
import { isSafeCheckoutRedirect } from "../../src/integrations/checkout/adapter";
import { createTestCheckoutRequest } from "../helpers/domain-fixtures";

const expectedStatuses: Record<MockCheckoutScenario, "succeeded" | "failed" | "cancelled"> = {
  cancelled: "cancelled",
  failure: "failed",
  success: "succeeded",
};

for (const [scenario, expectedStatus] of Object.entries(expectedStatuses) as Array<
  [MockCheckoutScenario, "succeeded" | "failed" | "cancelled"]
>) {
  test(`mock adapter returns normalized ${scenario} result`, async () => {
    const result = await mockCheckoutAdapter.execute(createTestCheckoutRequest(), scenario);

    assert.equal(result.kind, "completed");
    if (result.kind !== "completed") return;
    assert.equal(result.status, expectedStatus);
    assert.equal(result.diagnostics.adapterId, "mock-checkout");
    assert.equal(result.diagnostics.adapterName, "Mock checkout");
    assert.equal(result.diagnostics.scenario, scenario);
    assert.equal(result.diagnostics.provenance, "simulated");
    assert.match(result.diagnostics.executedAt, /^\d{4}-\d{2}-\d{2}T/);
  });
}

test("external placeholder is explicitly unsupported and never initiates checkout", async () => {
  const result = await externalCheckoutAdapter.execute(
    createTestCheckoutRequest(),
    "boundary-check"
  );
  assert.equal(result.kind, "unsupported");
  if (result.kind === "unsupported")
    assert.match(result.diagnostics.message, /No external call was made/);
});

test("checkout redirect validation rejects executable schemes and accepts web destinations", () => {
  assert.equal(isSafeCheckoutRedirect("javascript:alert(1)"), false);
  assert.equal(isSafeCheckoutRedirect("data:text/html,hi"), false);
  assert.equal(isSafeCheckoutRedirect("/checkout/return?sessionId=s-1"), true);
  assert.equal(isSafeCheckoutRedirect("https://checkout.example.test/session/1"), true);
});

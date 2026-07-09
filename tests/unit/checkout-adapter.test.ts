import assert from "node:assert/strict";
import test from "node:test";

import { mockCheckoutAdapter, type MockCheckoutScenario } from "../../src/integrations/checkout";
import { createTestCheckoutRequest } from "../helpers/domain-fixtures";

const expectedStatuses: Record<MockCheckoutScenario, "succeeded" | "failed" | "cancelled"> = {
  cancelled: "cancelled",
  failure: "failed",
  success: "succeeded",
};

for (const [scenario, expectedStatus] of Object.entries(expectedStatuses) as Array<
  [MockCheckoutScenario, "succeeded" | "failed" | "cancelled"]
>) {
  test(`mock adapter returns normalized ${scenario} result`, () => {
    const result = mockCheckoutAdapter.execute(createTestCheckoutRequest(), scenario);

    assert.equal(result.status, expectedStatus);
    assert.equal(result.diagnostics.adapterId, "mock-checkout");
    assert.equal(result.diagnostics.adapterName, "Mock checkout");
    assert.equal(result.diagnostics.scenario, scenario);
    assert.match(result.diagnostics.executedAt, /^\d{4}-\d{2}-\d{2}T/);
  });
}

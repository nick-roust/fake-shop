import { type CheckoutAdapter, type CheckoutRequest, type CheckoutResult } from "./adapter";

export type MockCheckoutScenario = "success" | "failure" | "cancelled";

const scenarioStatus = {
  success: "succeeded",
  failure: "failed",
  cancelled: "cancelled",
} as const satisfies Record<MockCheckoutScenario, CheckoutResult["status"]>;

const scenarioMessages = {
  success: "Mock checkout completed successfully.",
  failure: "Mock checkout returned a failure result.",
  cancelled: "Mock checkout was cancelled.",
} as const satisfies Record<MockCheckoutScenario, string>;

export const mockCheckoutAdapter: CheckoutAdapter<MockCheckoutScenario> = {
  id: "mock-checkout",
  name: "Mock checkout",
  execute(_request: CheckoutRequest, scenario: MockCheckoutScenario): CheckoutResult {
    return {
      status: scenarioStatus[scenario],
      diagnostics: {
        adapterId: mockCheckoutAdapter.id,
        adapterName: mockCheckoutAdapter.name,
        scenario,
        message: scenarioMessages[scenario],
        executedAt: new Date().toISOString(),
      },
    };
  },
};

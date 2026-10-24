import { type CheckoutAdapter, type CheckoutResult } from "./adapter";

export type SimulatedRedirectScenario = "delayed-success";

export const simulatedRedirectCheckoutAdapter: CheckoutAdapter<SimulatedRedirectScenario> = {
  id: "simulated-redirect-checkout",
  name: "Simulated redirect checkout",
  async execute(request, scenario): Promise<CheckoutResult> {
    await new Promise((resolve) => setTimeout(resolve, 25));
    return {
      kind: "pending",
      redirectUrl: `/checkout/return?sessionId=${encodeURIComponent(request.session.id)}`,
      externalReference: `simulated-${request.session.id}`,
      diagnostics: {
        adapterId: this.id,
        adapterName: this.name,
        scenario,
        message: "Simulated checkout is pending. This is not a real payment.",
        executedAt: new Date().toISOString(),
        provenance: "simulated",
      },
    };
  },
  async reconcile({ recoveryInfo }) {
    if (!recoveryInfo.externalReference) {
      return {
        kind: "unsupported" as const,
        diagnostics: {
          adapterId: simulatedRedirectCheckoutAdapter.id,
          adapterName: simulatedRedirectCheckoutAdapter.name,
          scenario: "simulated-return",
          message: "Simulated recovery requires its local reference.",
          executedAt: new Date().toISOString(),
          provenance: "simulated" as const,
        },
      };
    }
    return {
      kind: "completed" as const,
      status: "succeeded" as const,
      diagnostics: {
        adapterId: simulatedRedirectCheckoutAdapter.id,
        adapterName: simulatedRedirectCheckoutAdapter.name,
        scenario: "simulated-return",
        message: "Simulated adapter reported completion; no payment was verified.",
        executedAt: new Date().toISOString(),
        provenance: "simulated" as const,
      },
    };
  },
};

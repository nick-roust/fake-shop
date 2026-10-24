import { type CheckoutAdapter, type CheckoutRequest, type CheckoutResult } from "./adapter";

export type ExternalCheckoutScenario = "boundary-check";

export type ExternalCheckoutAdapterConfig = {
  endpoint?: string;
  reference?: string;
};

export const externalCheckoutAdapter: CheckoutAdapter<ExternalCheckoutScenario> = {
  id: "external-checkout",
  name: "External checkout",
  supportsInitiation: false,
  async execute(
    _request: CheckoutRequest,
    scenario: ExternalCheckoutScenario
  ): Promise<CheckoutResult> {
    return {
      kind: "unsupported",
      diagnostics: {
        adapterId: externalCheckoutAdapter.id,
        adapterName: externalCheckoutAdapter.name,
        scenario,
        message: "External checkout is not implemented. No external call was made.",
        executedAt: new Date().toISOString(),
        provenance: "local",
      },
    };
  },
};

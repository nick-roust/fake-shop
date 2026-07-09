import { type CheckoutAdapter, type CheckoutRequest, type CheckoutResult } from "./adapter";
import {
  type ExternalCheckoutResponseBoundary,
  mapCheckoutRequestToExternalBoundary,
  mapExternalBoundaryResponseToCheckoutResult,
} from "./external-checkout-mapping";

export type ExternalCheckoutScenario = "boundary-check";

export type ExternalCheckoutAdapterConfig = {
  endpoint?: string;
  reference?: string;
};

export const externalCheckoutAdapter: CheckoutAdapter<ExternalCheckoutScenario> = {
  id: "external-checkout",
  name: "External checkout",
  execute(request: CheckoutRequest, scenario: ExternalCheckoutScenario): CheckoutResult {
    const config = getExternalCheckoutConfig(request.configuration);
    const mappedRequest = mapCheckoutRequestToExternalBoundary(request, config);
    const configurationReady =
      mappedRequest.endpointConfigured && mappedRequest.referenceConfigured;
    const response: ExternalCheckoutResponseBoundary = {
      outcome: configurationReady ? "not-executed" : "configuration-missing",
      message: configurationReady
        ? "External checkout boundary prepared. No external call was made."
        : "External checkout boundary requires complete configuration.",
    };

    return mapExternalBoundaryResponseToCheckoutResult(response, {
      adapterId: externalCheckoutAdapter.id,
      adapterName: externalCheckoutAdapter.name,
      scenario,
      message: response.message,
      executedAt: new Date().toISOString(),
    });
  },
};

function getExternalCheckoutConfig(
  configuration: CheckoutRequest["configuration"]
): ExternalCheckoutAdapterConfig {
  return {
    endpoint: configuration?.endpoint,
    reference: configuration?.reference,
  };
}

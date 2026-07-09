import { type CheckoutRequest, type CheckoutResult } from "./adapter";
import { type ExternalCheckoutAdapterConfig } from "./external-checkout-adapter";

export type ExternalCheckoutRequestBoundary = {
  endpointConfigured: boolean;
  referenceConfigured: boolean;
  itemCount: number;
  orderId: string;
  sessionId: string;
  totalAmount: number;
  currency: string;
};

export type ExternalCheckoutResponseBoundary = {
  outcome: "configuration-missing" | "not-executed";
  message: string;
};

export function mapCheckoutRequestToExternalBoundary(
  request: CheckoutRequest,
  config: ExternalCheckoutAdapterConfig
): ExternalCheckoutRequestBoundary {
  return {
    endpointConfigured: Boolean(config.endpoint),
    referenceConfigured: Boolean(config.reference),
    itemCount: request.order.items.length,
    orderId: request.order.id,
    sessionId: request.session.id,
    totalAmount: request.order.total.amount,
    currency: request.order.total.currency,
  };
}

export function mapExternalBoundaryResponseToCheckoutResult(
  response: ExternalCheckoutResponseBoundary,
  diagnostics: CheckoutResult["diagnostics"]
): CheckoutResult {
  return {
    status: "failed",
    diagnostics: {
      ...diagnostics,
      message: response.message,
    },
  };
}

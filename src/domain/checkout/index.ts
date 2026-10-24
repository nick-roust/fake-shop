import { type Order } from "../order";
import { type EntityId, requireNonEmpty } from "../shared";

export type CheckoutSessionStatus = "created" | "pending" | "succeeded" | "failed" | "cancelled";
export type CheckoutAdapterConfiguration = Record<string, string | undefined>;

export type CheckoutSessionResultInfo = {
  adapterId?: string;
  adapterName?: string;
  externalReference?: string;
  message?: string;
  provenance?: "adapter-reported" | "simulated" | "local";
  redirectUrl?: string;
  recordedAt?: string;
  scenario?: string;
};

export type CheckoutSession = {
  id: EntityId;
  orderId: EntityId;
  status: CheckoutSessionStatus;
  createdAt: string;
  adapterId?: string;
  adapterConfiguration?: CheckoutAdapterConfiguration;
  result?: CheckoutSessionResultInfo;
};

export type CreateCheckoutSessionInput = {
  id: EntityId;
  orderId: EntityId;
  createdAt?: string;
  result?: CheckoutSessionResultInfo;
  status?: CheckoutSessionStatus;
  adapterId?: string;
  adapterConfiguration?: CheckoutAdapterConfiguration;
};

const allowedTransitions: Record<CheckoutSessionStatus, CheckoutSessionStatus[]> = {
  created: ["pending"],
  pending: ["succeeded", "failed", "cancelled"],
  succeeded: [],
  failed: [],
  cancelled: [],
};

export function createCheckoutSession(input: CreateCheckoutSessionInput): CheckoutSession {
  return {
    id: requireNonEmpty(input.id, "Checkout session id"),
    orderId: requireNonEmpty(input.orderId, "Order id"),
    createdAt: input.createdAt ?? new Date().toISOString(),
    adapterId: input.adapterId?.trim() || undefined,
    adapterConfiguration: input.adapterConfiguration
      ? { ...input.adapterConfiguration }
      : undefined,
    result: normalizeResultInfo(input.result),
    status: input.status ?? "created",
  };
}

export function createCheckoutSessionForOrder(
  id: EntityId,
  order: Pick<Order, "id">
): CheckoutSession {
  return createCheckoutSession({
    id,
    orderId: order.id,
  });
}

export function isFinalCheckoutSessionStatus(status: CheckoutSessionStatus): boolean {
  return status === "succeeded" || status === "failed" || status === "cancelled";
}

export function canTransitionCheckoutSession(
  currentStatus: CheckoutSessionStatus,
  nextStatus: CheckoutSessionStatus
): boolean {
  return allowedTransitions[currentStatus].includes(nextStatus);
}

export function transitionCheckoutSessionStatus(
  session: CheckoutSession,
  nextStatus: CheckoutSessionStatus,
  result?: CheckoutSessionResultInfo
): CheckoutSession {
  if (!canTransitionCheckoutSession(session.status, nextStatus)) {
    throw new Error(
      `Invalid checkout session status transition: ${session.status} to ${nextStatus}.`
    );
  }

  return createCheckoutSession({
    ...session,
    result: result ?? session.result,
    status: nextStatus,
  });
}

function normalizeResultInfo(
  result: CheckoutSessionResultInfo | undefined
): CheckoutSessionResultInfo | undefined {
  if (!result) {
    return undefined;
  }

  const normalized = {
    adapterId: result.adapterId?.trim() || undefined,
    adapterName: result.adapterName?.trim() || undefined,
    externalReference: result.externalReference?.trim() || undefined,
    message: result.message?.trim() || undefined,
    provenance: result.provenance,
    redirectUrl: result.redirectUrl?.trim() || undefined,
    recordedAt: result.recordedAt?.trim() || undefined,
    scenario: result.scenario?.trim() || undefined,
  };

  return Object.values(normalized).some(Boolean) ? normalized : undefined;
}

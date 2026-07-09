import { type Order } from "../order";
import { type EntityId, requireNonEmpty } from "../shared";

export type CheckoutSessionStatus = "created" | "pending" | "succeeded" | "failed" | "cancelled";

export type CheckoutSession = {
  id: EntityId;
  orderId: EntityId;
  status: CheckoutSessionStatus;
};

export type CreateCheckoutSessionInput = {
  id: EntityId;
  orderId: EntityId;
  status?: CheckoutSessionStatus;
};

export function createCheckoutSession(input: CreateCheckoutSessionInput): CheckoutSession {
  return {
    id: requireNonEmpty(input.id, "Checkout session id"),
    orderId: requireNonEmpty(input.orderId, "Order id"),
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

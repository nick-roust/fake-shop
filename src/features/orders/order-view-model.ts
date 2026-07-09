import { type CheckoutSession } from "@/domain/checkout";
import { type Customer } from "@/domain/customer";
import { type Order } from "@/domain/order";
import { type Shop } from "@/domain/shop";

export type OrderSummaryViewModel = {
  id: string;
  createdAt: string;
  customer: string;
  total: string;
  status: string;
  checkoutStatus: string;
};

export type OrderDetailsViewModel = OrderSummaryViewModel & {
  shop: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }>;
  checkoutSessionId: string;
  checkoutCreatedAt: string;
  selectedAdapter: string;
  diagnostics: string;
};

export function toOrderSummaryViewModel(
  order: Order,
  customer: Customer | undefined,
  session: CheckoutSession | undefined
): OrderSummaryViewModel {
  return {
    id: order.id,
    createdAt: formatDate(order.createdAt),
    customer: customer?.name ?? "Unknown customer",
    total: `${order.total.amount.toFixed(2)} ${order.total.currency}`,
    status: order.status,
    checkoutStatus: session?.status ?? "No checkout session",
  };
}

export function toOrderDetailsViewModel(
  order: Order,
  shop: Shop | undefined,
  customer: Customer | undefined,
  session: CheckoutSession | undefined
): OrderDetailsViewModel {
  const summary = toOrderSummaryViewModel(order, customer, session);

  return {
    ...summary,
    shop: shop?.name ?? "Unknown shop",
    customerEmail: customer?.email ?? "Not collected",
    customerPhone: customer?.phone ?? "Not collected",
    customerCountry: customer?.country ?? "Not collected",
    items: order.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: `${item.unitPrice.amount.toFixed(2)} ${item.unitPrice.currency}`,
      lineTotal: `${item.lineTotal.amount.toFixed(2)} ${item.lineTotal.currency}`,
    })),
    checkoutSessionId: session?.id ?? "No checkout session",
    checkoutCreatedAt: session ? formatDate(session.createdAt) : "Not created",
    selectedAdapter: session?.result?.adapterName ?? "Not recorded",
    diagnostics: formatDiagnostics(session),
  };
}

function formatDate(value: string | undefined): string {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDiagnostics(session: CheckoutSession | undefined): string {
  if (!session?.result) {
    return "No diagnostics recorded";
  }

  return [session.result.message, session.result.scenario, session.result.recordedAt]
    .filter(Boolean)
    .join(" | ");
}

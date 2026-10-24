import {
  type CheckoutAdapterConfiguration,
  type CheckoutSessionStatus,
  type CheckoutSession,
} from "@/domain/checkout";
import { type Order } from "@/domain/order";

export type CheckoutRequest = {
  configuration?: CheckoutAdapterConfiguration;
  order: Order;
  session: CheckoutSession;
};

export type CheckoutResultStatus = Extract<
  CheckoutSessionStatus,
  "succeeded" | "failed" | "cancelled"
>;

export type CheckoutDiagnostics = {
  adapterId: string;
  adapterName: string;
  scenario: string;
  message: string;
  executedAt: string;
  provenance: "adapter-reported" | "simulated" | "local";
};

export type CompletedCheckoutResult = {
  kind: "completed";
  status: CheckoutResultStatus;
  externalReference?: string;
  diagnostics: CheckoutDiagnostics;
};

export type PendingCheckoutResult = {
  kind: "pending";
  redirectUrl?: string;
  externalReference?: string;
  diagnostics: CheckoutDiagnostics;
};

export type UnsupportedCheckoutResult = {
  kind: "unsupported";
  diagnostics: CheckoutDiagnostics;
};

export type CheckoutResult =
  CompletedCheckoutResult | PendingCheckoutResult | UnsupportedCheckoutResult;

export type CheckoutReconciliation = {
  request: CheckoutRequest;
  recoveryInfo: { externalReference?: string; scenario?: string };
};

export type CheckoutAdapter<TScenario extends string = string> = {
  id: string;
  name: string;
  execute(request: CheckoutRequest, scenario: TScenario): Promise<CheckoutResult>;
  reconcile?(input: CheckoutReconciliation): Promise<CheckoutResult>;
  supportsInitiation?: boolean;
};

export function isSafeCheckoutRedirect(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, "http://fake-shop.local");
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

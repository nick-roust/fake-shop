import { type CheckoutSessionStatus, type CheckoutSession } from "@/domain/checkout";
import { type Order } from "@/domain/order";

export type CheckoutRequest = {
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
};

export type CheckoutResult = {
  status: CheckoutResultStatus;
  diagnostics: CheckoutDiagnostics;
};

export type CheckoutAdapter<TScenario extends string = string> = {
  id: string;
  name: string;
  execute(request: CheckoutRequest, scenario: TScenario): CheckoutResult;
};

"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  getCheckoutRecovery,
  simulateCheckoutReturn,
  type CheckoutRecoveryState,
} from "./checkout-service";

export function CheckoutReturnPage({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<CheckoutRecoveryState>();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setState(getCheckoutRecovery(sessionId)), 0);
    return () => window.clearTimeout(timeoutId);
  }, [sessionId]);

  async function simulateReturn() {
    setBusy(true);
    setActionError("");
    try {
      setState(await simulateCheckoutReturn(sessionId));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to reconcile checkout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout return</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm">
          A browser return only locates a local session. URL parameters do not confirm payment.
        </p>
        {!state || state.kind === "missing-session" ? (
          <Alert variant="warning">Checkout session was not found in this browser.</Alert>
        ) : null}
        {state?.kind === "not-started" ? (
          <Alert variant="neutral">Checkout has not been started for this session.</Alert>
        ) : null}
        {state?.kind === "pending" ? (
          <Alert variant="warning">
            Pending: {state.message} Provenance: {state.session.result?.provenance ?? "local"}.
          </Alert>
        ) : null}
        {state?.kind === "reconciliation-error" ? (
          <Alert variant="warning">Still pending. Reconciliation error: {state.message}</Alert>
        ) : null}
        {actionError ? <Alert variant="danger">{actionError}</Alert> : null}
        {state?.kind === "missing-order" ? (
          <Alert variant="warning">The related local order is missing.</Alert>
        ) : null}
        {state?.kind === "missing-adapter-binding" ? (
          <Alert variant="warning">This session has no usable adapter binding.</Alert>
        ) : null}
        {state?.kind === "wrong-adapter-binding" ? (
          <Alert variant="warning">
            The selected adapter does not match the adapter bound to this checkout attempt.
          </Alert>
        ) : null}
        {state?.kind === "unsupported" ? (
          <Alert variant="warning">
            Still pending. Adapter reconciliation is unsupported: {state.message}
          </Alert>
        ) : null}
        {state?.kind === "already-terminal" ? (
          <Alert variant="info">
            Stored adapter result: {state.session.status}. Provenance:{" "}
            {state.session.result?.provenance ?? "unknown"}. This is not independent payment
            verification.
          </Alert>
        ) : null}
        {state?.kind === "reconciled" ? (
          <Alert variant="info">
            Simulated adapter result: {state.session.status}. No payment was processed or verified.
          </Alert>
        ) : null}
        {state?.kind === "pending" && state.session.adapterId === "simulated-redirect-checkout" ? (
          <button
            className="inline-flex h-10 w-fit items-center justify-center rounded-md border border-border px-4 text-sm"
            disabled={busy}
            onClick={simulateReturn}
            type="button"
          >
            {busy ? "Simulating…" : "Simulate adapter return"}
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
}

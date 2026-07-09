"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { Grid, Stack } from "@/components/ui/layout";
import { StatusBadge } from "@/components/ui/status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  inspectDeveloperState,
  loadSampleDemoState,
  resetDeveloperState,
  type DeveloperStateSummary,
} from "./developer-experience-service";

export function DeveloperExperiencePage() {
  const [summary, setSummary] = useState<DeveloperStateSummary | undefined>();
  const [message, setMessage] = useState("Inspect local demo state or load sample data.");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSummary(inspectDeveloperState()), 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function handleLoadSampleData() {
    setSummary(loadSampleDemoState());
    setMessage("Sample demo data loaded into local demo storage.");
  }

  function handleResetData() {
    setSummary(resetDeveloperState());
    setMessage("Local demo storage reset to an empty state.");
  }

  if (!summary) {
    return <EmptyState title="Developer tools loading" />;
  }

  const sampleShopId = summary.sampleShopId ?? "sample-market";

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Developer experience</CardTitle>
          <CardDescription>
            Local demo utilities for reproducible setup, sample data, and state inspection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stack>
            <Alert variant="info">{message}</Alert>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleLoadSampleData}>Load sample data</Button>
              <Button onClick={handleResetData} variant="outline">
                Reset demo data
              </Button>
              <Button onClick={() => setSummary(inspectDeveloperState())} variant="secondary">
                Refresh inspection
              </Button>
            </div>
          </Stack>
        </CardContent>
      </Card>

      <Grid>
        <Card>
          <CardHeader>
            <CardTitle>State summary</CardTitle>
            <CardDescription>Current local demo storage counts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {Object.entries(summary.counts).map(([label, value]) => (
                  <TableRow key={label}>
                    <TableCell className="capitalize">{label.replaceAll("-", " ")}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checkout inspection</CardTitle>
            <CardDescription>Latest order and checkout session state.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.latestOrder || summary.latestSession ? (
              <Stack>
                <div className="flex flex-wrap gap-2">
                  {summary.latestOrder ? (
                    <StatusBadge tone="info">Order {summary.latestOrder.status}</StatusBadge>
                  ) : null}
                  {summary.latestSession ? (
                    <StatusBadge tone={getCheckoutTone(summary.latestSession.status)}>
                      Session {summary.latestSession.status}
                    </StatusBadge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {summary.latestOrder?.id ?? "No order"} /{" "}
                  {summary.latestSession?.id ?? "No checkout session"}
                </p>
              </Stack>
            ) : (
              <EmptyState
                description="Load sample data or complete a checkout preparation flow."
                title="No checkout state"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adapter modes</CardTitle>
            <CardDescription>Shop-level integration configuration summary.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.integrationModes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {summary.integrationModes.map((mode) => (
                  <StatusBadge key={mode.shopId} tone={mode.mode === "mock" ? "success" : "info"}>
                    {mode.shopId}: {mode.mode}
                  </StatusBadge>
                ))}
              </div>
            ) : (
              <EmptyState
                description="Load sample data or open integration settings for a shop."
                title="No adapter mode configured"
              />
            )}
          </CardContent>
        </Card>
      </Grid>

      <Card>
        <CardHeader>
          <CardTitle>Demo path</CardTitle>
          <CardDescription>Public local routes for quick manual validation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Step</TableHead>
                <TableHead>Route</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ["Inspect sample shop", `/shops/${sampleShopId}`],
                ["Review products", `/shops/${sampleShopId}/products`],
                ["Prepare checkout", `/shops/${sampleShopId}/checkout`],
                ["Inspect orders", `/shops/${sampleShopId}/orders`],
                ["Review integration settings", `/shops/${sampleShopId}/integration-settings`],
              ].map(([step, href]) => (
                <TableRow key={href}>
                  <TableCell>{step}</TableCell>
                  <TableCell>
                    <a className="text-primary underline-offset-4 hover:underline" href={href}>
                      {href}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function getCheckoutTone(status: string): "danger" | "info" | "neutral" | "success" | "warning" {
  if (status === "succeeded") {
    return "success";
  }

  if (status === "failed") {
    return "danger";
  }

  if (status === "cancelled") {
    return "warning";
  }

  return "info";
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/ui/state";
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

import { getDashboardSummary, type DashboardSummary } from "./dashboard-service";

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | undefined>();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSummary(getDashboardSummary()), 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!summary) {
    return <LoadingState title="Loading dashboard" />;
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review local shops, catalog coverage, order activity, and checkout outcomes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ActionLink href="/developer" variant="secondary">
            Load sample data
          </ActionLink>
          <ActionLink href="/shops">Manage shops</ActionLink>
        </div>
      </div>

      <Grid>
        <MetricCard
          description="Configured storefronts in local demo storage."
          label="Shops"
          value={summary.shops.total.toString()}
        />
        <MetricCard
          description={`${summary.products.active} active / ${summary.products.inactive} inactive`}
          label="Products"
          value={summary.products.total.toString()}
        />
        <MetricCard
          description={`${summary.orders.completed} completed / ${summary.orders.pending} pending`}
          label="Orders"
          value={summary.orders.total.toString()}
        />
        <MetricCard
          description={`${summary.checkoutSessions.succeeded} succeeded / ${summary.checkoutSessions.failed} failed / ${summary.checkoutSessions.cancelled} cancelled`}
          label="Checkout sessions"
          value={summary.checkoutSessions.total.toString()}
        />
      </Grid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>Latest order and checkout session activity.</CardDescription>
            </div>
            <StatusBadge tone={summary.recentOrders.length > 0 ? "success" : "neutral"}>
              {summary.recentOrders.length} shown
            </StatusBadge>
          </div>
        </CardHeader>
        <CardContent>
          {summary.recentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Checkout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        className="font-medium text-primary underline-offset-4 hover:underline"
                        href={`/shops/${order.shopId}/orders/${order.id}`}
                      >
                        {order.id}
                      </Link>
                      <div className="text-xs text-muted-foreground">{order.createdAt}</div>
                    </TableCell>
                    <TableCell>{order.shop}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      <StatusBadge tone={getOrderTone(order.status)}>{order.status}</StatusBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={getCheckoutTone(order.checkoutStatus)}>
                        {order.checkoutStatus}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              action={<ActionLink href="/developer">Load sample data</ActionLink>}
              description="Load sample data or complete a checkout flow to populate order activity."
              title="No orders yet"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Continue from the current local demo state.</CardDescription>
        </CardHeader>
        <CardContent>
          <Stack>
            <div className="flex flex-wrap gap-3">
              <ActionLink href="/shops" variant="secondary">
                Open shops
              </ActionLink>
              {summary.sampleShopId ? (
                <>
                  <ActionLink href={`/shops/${summary.sampleShopId}/products`} variant="outline">
                    Open products
                  </ActionLink>
                  <ActionLink href={`/shops/${summary.sampleShopId}/checkout`} variant="outline">
                    Prepare checkout
                  </ActionLink>
                  <ActionLink href={`/shops/${summary.sampleShopId}/orders`} variant="outline">
                    Inspect orders
                  </ActionLink>
                </>
              ) : null}
            </div>
            {!summary.sampleShopId ? (
              <p className="text-sm text-muted-foreground">
                Load sample data from Developer Tools to enable direct demo shortcuts.
              </p>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}

function ActionLink({
  children,
  href,
  variant = "primary",
}: {
  children: string;
  href: string;
  variant?: "outline" | "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
      : variant === "secondary"
        ? "inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-muted"
        : "inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted";

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

function MetricCard({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function getOrderTone(status: string): "danger" | "info" | "neutral" | "success" | "warning" {
  if (status === "completed") {
    return "success";
  }

  if (status === "cancelled") {
    return "warning";
  }

  if (status === "pending") {
    return "info";
  }

  return "neutral";
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

  if (status === "pending" || status === "created") {
    return "info";
  }

  return "neutral";
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/ui/state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { type OrderRecord, getOrderRecord } from "./order-service";
import { toOrderDetailsViewModel } from "./order-view-model";

type OrderDetailsPageProps = {
  orderId: string;
  shopId: string;
};

export function OrderDetailsPage({ orderId, shopId }: OrderDetailsPageProps) {
  const [loaded, setLoaded] = useState(false);
  const [record, setRecord] = useState<OrderRecord | undefined>();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setRecord(getOrderRecord(orderId, shopId));
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [orderId, shopId]);

  if (!loaded) {
    return <LoadingState title="Loading order" />;
  }

  if (!record) {
    return (
      <EmptyState
        action={
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
            href={`/shops/${shopId}/orders`}
          >
            Back to orders
          </Link>
        }
        description="The selected order does not exist in local demo storage."
        title="Order not found"
      />
    );
  }

  const viewModel = toOrderDetailsViewModel(
    record.order,
    record.shop,
    record.customer,
    record.session
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Order {viewModel.id}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{viewModel.createdAt}</p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
          href={`/shops/${shopId}/orders`}
        >
          Orders
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Order information</CardTitle>
            <Badge>{viewModel.status}</Badge>
          </div>
          <CardDescription>{viewModel.shop}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm md:grid-cols-3">
            <SummaryItem label="Customer" value={viewModel.customer} />
            <SummaryItem label="Email" value={viewModel.customerEmail} />
            <SummaryItem label="Phone" value={viewModel.customerPhone} />
            <SummaryItem label="Country" value={viewModel.customerCountry} />
            <SummaryItem label="Total" value={viewModel.total} />
            <SummaryItem label="Order status" value={viewModel.status} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order items</CardTitle>
          <CardDescription>Product snapshots captured at order creation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit price</TableHead>
                <TableHead>Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewModel.items.map((item) => (
                <TableRow key={`${item.productId}-${item.productName}`}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unitPrice}</TableCell>
                  <TableCell>{item.lineTotal}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Checkout information</CardTitle>
            <Badge>{viewModel.checkoutStatus}</Badge>
          </div>
          <CardDescription>Neutral checkout session visibility.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm md:grid-cols-3">
            <SummaryItem label="Checkout session" value={viewModel.checkoutSessionId} />
            <SummaryItem label="Created" value={viewModel.checkoutCreatedAt} />
            <SummaryItem label="Selected adapter" value={viewModel.selectedAdapter} />
            <SummaryItem label="Diagnostics" value={viewModel.diagnostics} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-medium">{value}</dd>
    </div>
  );
}

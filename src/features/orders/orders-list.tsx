"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { type OrderRecord } from "./order-service";
import { toOrderSummaryViewModel } from "./order-view-model";

type OrdersListProps = {
  orders: OrderRecord[];
  shopId: string;
};

export function OrdersList({ orders, shopId }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        description="Completed, failed, and cancelled checkout attempts will appear here after checkout preparation runs."
        title="No orders for this shop"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>Orders created from checkout preparation.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Order status</TableHead>
              <TableHead>Checkout status</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(({ customer, order, session }) => {
              const viewModel = toOrderSummaryViewModel(order, customer, session);

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{viewModel.id}</TableCell>
                  <TableCell>{viewModel.createdAt}</TableCell>
                  <TableCell>{viewModel.customer}</TableCell>
                  <TableCell>{viewModel.total}</TableCell>
                  <TableCell>
                    <Badge>{viewModel.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={session?.status === "succeeded" ? "success" : "neutral"}>
                      {viewModel.checkoutStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      href={`/shops/${shopId}/orders/${order.id}`}
                    >
                      Open
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/state";

import { type OrderRecord, listShopOrders } from "./order-service";
import { OrdersList } from "./orders-list";

type OrdersPageProps = {
  shopId: string;
};

export function OrdersPage({ shopId }: OrdersPageProps) {
  const [loaded, setLoaded] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setOrders(listShopOrders(shopId));
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [shopId]);

  if (!loaded) {
    return <LoadingState title="Loading orders" />;
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inspect order state and checkout session visibility for this shop.
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
          href={`/shops/${shopId}`}
        >
          Shop details
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visibility scope</CardTitle>
          <CardDescription>
            This view shows order records and checkout session outcomes only.
          </CardDescription>
        </CardHeader>
      </Card>

      <OrdersList orders={orders} shopId={shopId} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Shop } from "@/domain/shop";

import { ShopForm, type ShopFormValues } from "./shop-form";
import { ShopList } from "./shop-list";
import { createManagedShop, listShops } from "./shop-service";

export function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setShops(listShops()), 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function handleCreateShop(values: ShopFormValues) {
    createManagedShop(values);
    setShops(listShops());
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Shop management</CardTitle>
          <CardDescription>Create and maintain fake storefronts for local demos.</CardDescription>
        </CardHeader>
        <CardContent>
          <ShopForm onSubmit={handleCreateShop} submitLabel="Create shop" />
        </CardContent>
      </Card>

      <ShopList shops={shops} />
    </div>
  );
}

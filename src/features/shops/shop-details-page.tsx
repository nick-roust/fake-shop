"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/state";
import { type Shop } from "@/domain/shop";

import { ShopDetails } from "./shop-details";
import { type ShopFormValues } from "./shop-form";
import { getShop, updateManagedShop } from "./shop-service";

type ShopDetailsPageProps = {
  shopId: string;
};

export function ShopDetailsPage({ shopId }: ShopDetailsPageProps) {
  const [shop, setShop] = useState<Shop | undefined>();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setShop(getShop(shopId)), 0);

    return () => window.clearTimeout(timeoutId);
  }, [shopId]);

  function handleSave(values: ShopFormValues) {
    if (!shop) {
      return;
    }

    setShop(updateManagedShop(shop, values));
    setEditing(false);
  }

  if (!shop) {
    return (
      <EmptyState
        action={
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
            href="/shops"
          >
            Back to shops
          </Link>
        }
        description="The selected shop does not exist in local demo storage."
        title="No selected shop"
      />
    );
  }

  return (
    <ShopDetails
      editing={editing}
      onCancelEdit={() => setEditing(false)}
      onEdit={() => setEditing(true)}
      onSave={handleSave}
      shop={shop}
    />
  );
}

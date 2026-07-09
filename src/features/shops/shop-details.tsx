"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid, Stack } from "@/components/ui/layout";
import { type Shop } from "@/domain/shop";

import { ShopForm } from "./shop-form";
import { toShopViewModel } from "./shop-view-model";

type ShopDetailsProps = {
  editing: boolean;
  onCancelEdit: () => void;
  onEdit: () => void;
  onSave: Parameters<typeof ShopForm>[0]["onSubmit"];
  productCount: number;
  shop: Shop;
};

export function ShopDetails({
  editing,
  onCancelEdit,
  onEdit,
  onSave,
  productCount,
  shop,
}: ShopDetailsProps) {
  const viewModel = toShopViewModel(shop);

  return (
    <Stack>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge>Local demo shop</Badge>
              <CardTitle>{viewModel.name}</CardTitle>
              <CardDescription>{viewModel.description}</CardDescription>
            </div>
            <Button onClick={onEdit} variant="secondary">
              Edit shop
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Grid>
            <MetadataItem label="Category" value={viewModel.category} />
            <MetadataItem label="Scenario" value={viewModel.scenario} />
            <MetadataItem label="Display name" value={viewModel.displayName} />
            <MetadataItem label="Accent color" value={viewModel.accentColor} />
            <MetadataItem label="Products" value={productCount.toString()} />
          </Grid>
        </CardContent>
      </Card>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit shop</CardTitle>
            <CardDescription>Update storefront information and display settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <ShopForm
              initialShop={shop}
              onCancel={onCancelEdit}
              onSubmit={onSave}
              submitLabel="Save shop"
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Manage demo products that belong to this shop.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
            href={`/shops/${shop.id}/products`}
          >
            Open products
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Inspect orders and checkout outcomes created from this shop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
            href={`/shops/${shop.id}/orders`}
          >
            Open orders
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration settings</CardTitle>
          <CardDescription>
            Configure checkout mode and adapter settings for this shop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
            href={`/shops/${shop.id}/integration-settings`}
          >
            Open integration settings
          </Link>
        </CardContent>
      </Card>
    </Stack>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-medium">{value}</div>
    </div>
  );
}

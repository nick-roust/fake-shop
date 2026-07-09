"use client";

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
  shop: Shop;
};

export function ShopDetails({ editing, onCancelEdit, onEdit, onSave, shop }: ShopDetailsProps) {
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
          <CardTitle>Future areas</CardTitle>
          <CardDescription>
            Product catalog, checkout, and order views will connect to this shop in later phases.
          </CardDescription>
        </CardHeader>
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

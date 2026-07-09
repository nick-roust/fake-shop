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
import { type Shop } from "@/domain/shop";

import { toShopViewModel } from "./shop-view-model";

type ShopListProps = {
  shops: Shop[];
};

export function ShopList({ shops }: ShopListProps) {
  if (shops.length === 0) {
    return (
      <EmptyState
        description="Create a fake shop to prepare catalog, checkout, and order flows."
        title="No shops available"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shops</CardTitle>
        <CardDescription>Available fake storefronts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Scenario</TableHead>
              <TableHead>Display</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.map((shop) => {
              const viewModel = toShopViewModel(shop);

              return (
                <TableRow key={viewModel.id}>
                  <TableCell>
                    <div className="font-medium">{viewModel.name}</div>
                    <div className="text-xs text-muted-foreground">{viewModel.description}</div>
                  </TableCell>
                  <TableCell>{viewModel.category}</TableCell>
                  <TableCell>
                    <Badge>{viewModel.scenario}</Badge>
                  </TableCell>
                  <TableCell>{viewModel.displayName}</TableCell>
                  <TableCell>
                    <Link
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      href={`/shops/${viewModel.id}`}
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

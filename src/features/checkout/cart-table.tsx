"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { type Cart } from "@/domain/cart";

import { toCartViewModel } from "./checkout-view-model";

type CartTableProps = {
  cart?: Cart;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export function CartTable({ cart, onQuantityChange, onRemove }: CartTableProps) {
  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        description="Select products to prepare a cart for checkout."
        title="Cart is empty"
      />
    );
  }

  const viewModel = toCartViewModel(cart);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cart</CardTitle>
        <CardDescription>Selected products and deterministic totals.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit price</TableHead>
              <TableHead>Line total</TableHead>
              <TableHead>Remove</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viewModel.items.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>{item.productName}</TableCell>
                <TableCell>
                  <Input
                    className="w-24"
                    min="1"
                    onChange={(event) =>
                      onQuantityChange(item.productId, Number(event.target.value))
                    }
                    type="number"
                    value={item.quantity}
                  />
                </TableCell>
                <TableCell>
                  {item.unitPrice} {viewModel.currency}
                </TableCell>
                <TableCell>
                  {item.lineTotal} {viewModel.currency}
                </TableCell>
                <TableCell>
                  <Button onClick={() => onRemove(item.productId)} variant="secondary">
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-semibold" colSpan={3}>
                Total
              </TableCell>
              <TableCell className="font-semibold">
                {viewModel.total} {viewModel.currency}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { type Product } from "@/domain/product";

type ProductSelectionProps = {
  onAddProduct: (product: Product) => void;
  products: Product[];
};

export function ProductSelection({ onAddProduct, products }: ProductSelectionProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        description="Create active products before preparing a cart."
        title="No selectable products"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select products</CardTitle>
        <CardDescription>Add active demo products to the cart.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Add</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.description || "No description"}
                  </div>
                </TableCell>
                <TableCell>
                  {product.price.amount.toFixed(2)} {product.price.currency}
                </TableCell>
                <TableCell>
                  <Badge variant="success">Active</Badge>
                </TableCell>
                <TableCell>
                  <Button onClick={() => onAddProduct(product)}>Add</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

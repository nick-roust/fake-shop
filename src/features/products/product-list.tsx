"use client";

import { useState } from "react";
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
import { type Category, type Product } from "@/domain/product";

import { ProductForm, type ProductFormValues } from "./product-form";
import { toProductViewModel } from "./product-view-model";

type ProductListProps = {
  categories: Category[];
  onEditProduct: (product: Product, values: ProductFormValues) => void;
  products: Product[];
};

export function ProductList({ categories, onEditProduct, products }: ProductListProps) {
  const [editingProductId, setEditingProductId] = useState<string | undefined>();

  if (products.length === 0) {
    return (
      <EmptyState
        description="Create a demo product for this shop to prepare the catalog for later phases."
        title="No products in this shop"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>Demo products linked to the selected shop.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const viewModel = toProductViewModel(product, categories);
              const editing = editingProductId === product.id;

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{viewModel.name}</div>
                    <div className="text-xs text-muted-foreground">{viewModel.description}</div>
                    {editing ? (
                      <div className="mt-4 min-w-[18rem]">
                        <ProductForm
                          categories={categories}
                          initialCategoryName={viewModel.category}
                          initialProduct={product}
                          onCancel={() => setEditingProductId(undefined)}
                          onSubmit={(values) => {
                            onEditProduct(product, values);
                            setEditingProductId(undefined);
                          }}
                          submitLabel="Save product"
                        />
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>{viewModel.category}</TableCell>
                  <TableCell>
                    {viewModel.price} {viewModel.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant={viewModel.active ? "success" : "neutral"}>
                      {viewModel.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => setEditingProductId(editing ? undefined : product.id)}
                      variant="secondary"
                    >
                      Edit
                    </Button>
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

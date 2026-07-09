"use client";

import { useId, useState, type FormEvent } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/form";
import { Grid } from "@/components/ui/layout";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { type Category, type Product } from "@/domain/product";

export type ProductFormValues = {
  name: string;
  description: string;
  categoryName: string;
  price: string;
  currency: string;
  active: boolean;
};

type ProductFormProps = {
  categories: Category[];
  initialProduct?: Product;
  initialCategoryName?: string;
  onCancel?: () => void;
  onSubmit: (values: ProductFormValues) => void;
  submitLabel: string;
};

const currencyOptions = ["USD", "EUR", "GBP"] as const;

export function ProductForm({
  categories,
  initialCategoryName = "",
  initialProduct,
  onCancel,
  onSubmit,
  submitLabel,
}: ProductFormProps) {
  const fieldId = useId();
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [categoryName, setCategoryName] = useState(initialCategoryName);
  const [price, setPrice] = useState(initialProduct?.price.amount.toString() ?? "");
  const [currency, setCurrency] = useState(initialProduct?.price.currency ?? "USD");
  const [active, setActive] = useState(initialProduct?.active ?? true);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (name.trim().length === 0) {
      setError("Product name is required.");
      return;
    }

    const priceValue = Number(price);

    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setError("Price must be a finite non-negative number.");
      return;
    }

    setError("");
    onSubmit({
      name,
      description,
      categoryName,
      price,
      currency,
      active,
    });
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <FieldGroup>
        <Grid>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-name`}>Product name</FieldLabel>
            <Input
              id={`${fieldId}-name`}
              onChange={(event) => setName(event.target.value)}
              placeholder="Demo product"
              value={name}
            />
            <FieldError>{error}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor={`${fieldId}-category`}>Category</FieldLabel>
            <Input
              id={`${fieldId}-category`}
              list={`${fieldId}-categories`}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="Create or select category"
              value={categoryName}
            />
            <datalist id={`${fieldId}-categories`}>
              {categories.map((category) => (
                <option key={category.id} value={category.name} />
              ))}
            </datalist>
            {categories.length === 0 ? (
              <FieldDescription>No categories available yet.</FieldDescription>
            ) : null}
          </Field>
        </Grid>

        <Field>
          <FieldLabel htmlFor={`${fieldId}-description`}>Description</FieldLabel>
          <Input
            id={`${fieldId}-description`}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short product description"
            value={description}
          />
        </Field>

        <Grid>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-price`}>Price</FieldLabel>
            <Input
              id={`${fieldId}-price`}
              min="0"
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0.00"
              step="0.01"
              type="number"
              value={price}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`${fieldId}-currency`}>Currency</FieldLabel>
            <Select
              id={`${fieldId}-currency`}
              onChange={(event) => setCurrency(event.target.value)}
              value={currency}
            >
              {currencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
        </Grid>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={active} onChange={(event) => setActive(event.target.checked)} />
          Active product
        </label>
      </FieldGroup>

      <div className="flex flex-wrap gap-3">
        <Button type="submit">{submitLabel}</Button>
        {onCancel ? (
          <Button onClick={onCancel} type="button" variant="secondary">
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/form";
import { Grid } from "@/components/ui/layout";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { type Shop } from "@/domain/shop";

export type ShopFormValues = {
  name: string;
  description: string;
  category: string;
  scenario: string;
  displayName: string;
  accentColor: string;
};

type ShopFormProps = {
  initialShop?: Shop;
  onCancel?: () => void;
  onSubmit: (values: ShopFormValues) => void;
  submitLabel: string;
};

const scenarioOptions = [
  { label: "General demo", value: "general-demo" },
  { label: "Digital goods", value: "digital-goods" },
  { label: "Services", value: "services" },
  { label: "Events", value: "events" },
] as const;

export function ShopForm({ initialShop, onCancel, onSubmit, submitLabel }: ShopFormProps) {
  const fieldId = useId();
  const [name, setName] = useState(initialShop?.name ?? "");
  const [description, setDescription] = useState(initialShop?.description ?? "");
  const [category, setCategory] = useState(initialShop?.category ?? "");
  const [scenario, setScenario] = useState(initialShop?.scenario ?? "general-demo");
  const [displayName, setDisplayName] = useState(initialShop?.displaySettings?.displayName ?? "");
  const [accentColor, setAccentColor] = useState(initialShop?.displaySettings?.accentColor ?? "");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (name.trim().length === 0) {
      setError("Shop name is required.");
      return;
    }

    setError("");
    onSubmit({
      name,
      description,
      category,
      scenario,
      displayName,
      accentColor,
    });
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <FieldGroup>
        <Grid>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-name`}>Shop name</FieldLabel>
            <Input
              id={`${fieldId}-name`}
              onChange={(event) => setName(event.target.value)}
              placeholder="Demo storefront"
              value={name}
            />
            <FieldError>{error}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor={`${fieldId}-display-name`}>Display name</FieldLabel>
            <Input
              id={`${fieldId}-display-name`}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Customer-facing label"
              value={displayName}
            />
          </Field>
        </Grid>

        <Field>
          <FieldLabel htmlFor={`${fieldId}-description`}>Description</FieldLabel>
          <Input
            id={`${fieldId}-description`}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short shop description"
            value={description}
          />
        </Field>

        <Grid>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-category`}>Category</FieldLabel>
            <Input
              id={`${fieldId}-category`}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Example: apparel"
              value={category}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`${fieldId}-scenario`}>Scenario type</FieldLabel>
            <Select
              id={`${fieldId}-scenario`}
              onChange={(event) => setScenario(event.target.value)}
              value={scenario}
            >
              {scenarioOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </Grid>

        <Field>
          <FieldLabel htmlFor={`${fieldId}-accent-color`}>Accent color</FieldLabel>
          <Input
            id={`${fieldId}-accent-color`}
            onChange={(event) => setAccentColor(event.target.value)}
            placeholder="Example: emerald"
            value={accentColor}
          />
          <FieldDescription>Optional display setting for shop surfaces.</FieldDescription>
        </Field>
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

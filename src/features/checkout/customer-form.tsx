"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/form";
import { Grid } from "@/components/ui/layout";
import { Input } from "@/components/ui/input";

export type CustomerFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
};

type CustomerFormProps = {
  initialValues?: CustomerFormValues;
  onSubmit: (values: CustomerFormValues) => void;
};

const emptyValues: CustomerFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
};

export function CustomerForm({ initialValues = emptyValues, onSubmit }: CustomerFormProps) {
  const fieldId = useId();
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");

  function updateValue(field: keyof CustomerFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.firstName.trim() || !values.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    if (!values.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!values.country.trim()) {
      setError("Country is required.");
      return;
    }

    setError("");
    onSubmit(values);
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <FieldGroup>
        <Grid>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-first-name`}>First name</FieldLabel>
            <Input
              id={`${fieldId}-first-name`}
              onChange={(event) => updateValue("firstName", event.target.value)}
              value={values.firstName}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-last-name`}>Last name</FieldLabel>
            <Input
              id={`${fieldId}-last-name`}
              onChange={(event) => updateValue("lastName", event.target.value)}
              value={values.lastName}
            />
          </Field>
        </Grid>

        <Grid>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-email`}>Email</FieldLabel>
            <Input
              id={`${fieldId}-email`}
              onChange={(event) => updateValue("email", event.target.value)}
              type="email"
              value={values.email}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-phone`}>Phone</FieldLabel>
            <Input
              id={`${fieldId}-phone`}
              onChange={(event) => updateValue("phone", event.target.value)}
              value={values.phone}
            />
          </Field>
        </Grid>

        <Grid>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-country`}>Country</FieldLabel>
            <Input
              id={`${fieldId}-country`}
              onChange={(event) => updateValue("country", event.target.value)}
              value={values.country}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-postal-code`}>Postal code</FieldLabel>
            <Input
              id={`${fieldId}-postal-code`}
              onChange={(event) => updateValue("postalCode", event.target.value)}
              value={values.postalCode}
            />
          </Field>
        </Grid>

        <Field>
          <FieldLabel htmlFor={`${fieldId}-address-line-1`}>Address line 1</FieldLabel>
          <Input
            id={`${fieldId}-address-line-1`}
            onChange={(event) => updateValue("addressLine1", event.target.value)}
            value={values.addressLine1}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={`${fieldId}-address-line-2`}>Address line 2</FieldLabel>
          <Input
            id={`${fieldId}-address-line-2`}
            onChange={(event) => updateValue("addressLine2", event.target.value)}
            value={values.addressLine2}
          />
        </Field>

        <Grid>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-city`}>City</FieldLabel>
            <Input
              id={`${fieldId}-city`}
              onChange={(event) => updateValue("city", event.target.value)}
              value={values.city}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${fieldId}-region`}>Region</FieldLabel>
            <Input
              id={`${fieldId}-region`}
              onChange={(event) => updateValue("region", event.target.value)}
              value={values.region}
            />
          </Field>
        </Grid>

        <FieldError>{error}</FieldError>
      </FieldGroup>

      <Button type="submit">Prepare checkout</Button>
    </form>
  );
}

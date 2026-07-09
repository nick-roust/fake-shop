"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/form";
import { Grid } from "@/components/ui/layout";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { type IntegrationMode } from "@/storage";

import {
  getIntegrationSettings,
  saveIntegrationSettings,
  type IntegrationSettingsState,
} from "./integration-settings-service";

type IntegrationSettingsPageProps = {
  shopId: string;
};

export function IntegrationSettingsPage({ shopId }: IntegrationSettingsPageProps) {
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<IntegrationMode>("mock");
  const [externalBaseUrl, setExternalBaseUrl] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [state, setState] = useState<IntegrationSettingsState | undefined>();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const settings = getIntegrationSettings(shopId);

      setState(settings);
      setMode(settings.configuration.mode);
      setExternalBaseUrl(settings.configuration.externalBaseUrl ?? "");
      setExternalReference(settings.configuration.externalReference ?? "");
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [shopId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const settings = saveIntegrationSettings(shopId, {
      mode,
      externalBaseUrl,
      externalReference,
    });

    setState(settings);
  }

  if (!loaded) {
    return <LoadingState title="Loading integration settings" />;
  }

  if (!state?.shop) {
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
        description="Create or select a shop before configuring integrations."
        title="No selected shop"
      />
    );
  }

  const configurationReady = state.missingSettings.length === 0;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{state.shop.name} integration settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure shop-level checkout mode without executing checkout.
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
          href={`/shops/${state.shop.id}`}
        >
          Shop details
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Configuration status</CardTitle>
            <Badge variant={configurationReady ? "success" : "warning"}>
              {configurationReady ? "Ready" : "Missing settings"}
            </Badge>
          </div>
          <CardDescription>
            Mock mode is available by default. External mode can be selected without calling any
            external system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm md:grid-cols-3">
            <SummaryItem label="Selected mode" value={state.configuration.mode} />
            <SummaryItem
              label="External base URL"
              value={state.configuration.externalBaseUrl ?? "Not configured"}
            />
            <SummaryItem
              label="External reference"
              value={state.configuration.externalReference ?? "Not configured"}
            />
          </dl>
        </CardContent>
      </Card>

      {state.missingSettings.length > 0 ? (
        <Alert variant="warning">{state.missingSettings.join(" ")}</Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Checkout mode</CardTitle>
          <CardDescription>Configuration belongs to this shop only.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="integration-mode">Integration mode</FieldLabel>
                <Select
                  id="integration-mode"
                  onChange={(event) => setMode(event.target.value as IntegrationMode)}
                  value={mode}
                >
                  <option value="mock">Mock mode</option>
                  <option value="external">External API mode</option>
                </Select>
                <FieldDescription>
                  Selecting external mode only validates configuration in this phase.
                </FieldDescription>
              </Field>

              <Grid>
                <Field>
                  <FieldLabel htmlFor="external-base-url">External base URL</FieldLabel>
                  <Input
                    id="external-base-url"
                    onChange={(event) => setExternalBaseUrl(event.target.value)}
                    placeholder="https://example.test/checkout"
                    value={externalBaseUrl}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="external-reference">External reference</FieldLabel>
                  <Input
                    id="external-reference"
                    onChange={(event) => setExternalReference(event.target.value)}
                    placeholder="Reference label"
                    value={externalReference}
                  />
                </Field>
              </Grid>
            </FieldGroup>

            <Button type="submit">Save settings</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-medium">{value}</dd>
    </div>
  );
}

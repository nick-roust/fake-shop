"use client";

import { type Shop } from "@/domain/shop";
import { type IntegrationConfiguration, type IntegrationMode } from "@/storage";
import { getLocalDemoRepositories } from "@/storage/local-demo-boundary";

export type IntegrationSettingsValues = {
  mode: IntegrationMode;
  externalBaseUrl: string;
  externalReference: string;
};

export type IntegrationSettingsState = {
  configuration: IntegrationConfiguration;
  missingSettings: string[];
  shop?: Shop;
};

export function getIntegrationSettings(shopId: string): IntegrationSettingsState {
  const repositories = getLocalDemoRepositories();
  const shop = repositories.shops.getById(shopId);
  const configuration = getOrCreateConfiguration(shopId);

  return {
    shop,
    configuration,
    missingSettings: validateConfiguration(configuration),
  };
}

export function saveIntegrationSettings(
  shopId: string,
  values: IntegrationSettingsValues
): IntegrationSettingsState {
  const configuration = getLocalDemoRepositories().integrationConfigurations.save({
    id: getConfigurationId(shopId),
    shopId,
    mode: values.mode,
    externalBaseUrl: values.externalBaseUrl.trim() || undefined,
    externalReference: values.externalReference.trim() || undefined,
    updatedAt: new Date().toISOString(),
  });

  return {
    shop: getLocalDemoRepositories().shops.getById(shopId),
    configuration,
    missingSettings: validateConfiguration(configuration),
  };
}

export function validateConfiguration(configuration: IntegrationConfiguration): string[] {
  if (configuration.mode === "mock") {
    return [];
  }

  return [
    configuration.externalBaseUrl ? "" : "External base URL is required.",
    configuration.externalReference ? "" : "External reference is required.",
  ].filter(Boolean);
}

function getOrCreateConfiguration(shopId: string): IntegrationConfiguration {
  const repositories = getLocalDemoRepositories();
  const existingConfiguration = repositories.integrationConfigurations.getById(
    getConfigurationId(shopId)
  );

  if (existingConfiguration) {
    return existingConfiguration;
  }

  return repositories.integrationConfigurations.save({
    id: getConfigurationId(shopId),
    shopId,
    mode: "mock",
    updatedAt: new Date().toISOString(),
  });
}

function getConfigurationId(shopId: string): string {
  return `integration-${shopId}`;
}

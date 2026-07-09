import { type EntityId, requireNonEmpty } from "../shared";

export type CustomerAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
};

export type Customer = {
  id: EntityId;
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  address?: CustomerAddress;
};

export type CreateCustomerInput = {
  id: EntityId;
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  address?: CustomerAddress;
};

export function createCustomer(input: CreateCustomerInput): Customer {
  return {
    id: requireNonEmpty(input.id, "Customer id"),
    name: requireNonEmpty(input.name, "Customer name"),
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    country: input.country?.trim() || undefined,
    address: normalizeAddress(input.address),
  };
}

function normalizeAddress(address: CustomerAddress | undefined): CustomerAddress | undefined {
  if (!address) {
    return undefined;
  }

  const normalized = {
    line1: address.line1?.trim() || undefined,
    line2: address.line2?.trim() || undefined,
    city: address.city?.trim() || undefined,
    region: address.region?.trim() || undefined,
    postalCode: address.postalCode?.trim() || undefined,
    country: address.country?.trim() || undefined,
  };

  return Object.values(normalized).some(Boolean) ? normalized : undefined;
}

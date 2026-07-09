export type EntityId = string;
export type CurrencyCode = string;

export type Money = {
  amount: number;
  currency: CurrencyCode;
};

export function requireNonEmpty(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalized;
}

export function requireNonNegativeAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Amount must be a finite non-negative number.");
  }

  return amount;
}

export function requirePositiveQuantity(quantity: number): number {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer.");
  }

  return quantity;
}

export function createMoney(amount: number, currency: CurrencyCode): Money {
  return {
    amount: requireNonNegativeAmount(amount),
    currency: requireNonEmpty(currency, "Currency"),
  };
}

export function assertSameCurrency(left: Money, right: Money): void {
  if (left.currency !== right.currency) {
    throw new Error("Money values must use the same currency.");
  }
}

export function addMoney(left: Money, right: Money): Money {
  assertSameCurrency(left, right);

  return createMoney(left.amount + right.amount, left.currency);
}

export function multiplyMoney(value: Money, quantity: number): Money {
  return createMoney(value.amount * requirePositiveQuantity(quantity), value.currency);
}

export function sumMoney(values: Money[], currency: CurrencyCode): Money {
  return values.reduce((total, value) => addMoney(total, value), createMoney(0, currency));
}

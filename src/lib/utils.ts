import { type ClassValue, clsx } from "clsx";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPKR(value: number | string | { toString(): string } | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function toSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true });
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function truncate(value: string, length = 140) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

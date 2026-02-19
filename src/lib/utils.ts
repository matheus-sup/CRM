import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serializeForClient<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function formatCurrency(value: number | string) {
  const amount = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

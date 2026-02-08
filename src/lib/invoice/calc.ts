import type { Invoice } from "./types";

export function lineTotal(qty: number, unitPrice: number) {
  return qty * unitPrice;
}

export function invoiceSubtotal(inv: Invoice) {
  return inv.lines.reduce((sum, l) => sum + lineTotal(l.qty, l.unitPrice), 0);
}

export function formatEUR(amount: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

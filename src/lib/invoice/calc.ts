import type { Invoice } from "./types";

export function lineTotal(qty: number, unitPrice: number) {
  return qty * unitPrice;
}

export function invoiceSubtotal(inv: Invoice) {
  return inv.lines.reduce((sum, l) => sum + lineTotal(l.qty, l.unitPrice), 0);
}

export function invoiceVatRate(inv: Invoice) {
  if (inv.vatMode !== "standard") return 0;
  // default to 21% if not set
  return typeof inv.vatRate === "number" ? inv.vatRate : 0.21;
}

export function invoiceVatAmount(inv: Invoice) {
  return invoiceSubtotal(inv) * invoiceVatRate(inv);
}

export function invoiceTotal(inv: Invoice) {
  return invoiceSubtotal(inv) + invoiceVatAmount(inv);
}

export function vatLabel(inv: Invoice) {
  if (inv.vatMode === "reverse_charge") return "BTW verlegd";
  if (inv.vatMode === "zero") return "BTW 0%";
  const r = invoiceVatRate(inv);
  return `BTW ${Math.round(r * 100)}%`;
}

export function formatEUR(amount: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
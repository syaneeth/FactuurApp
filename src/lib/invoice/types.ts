export type Company = {
  name: string;
  legalName?: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  kvk?: string;
  vat?: string;
  iban?: string;
};

export type Customer = {
  name: string;
  attn?: string;
  address: string;
  city: string;
  country: string;
  vat?: string;
  customerNumber?: string;
};

export type InvoiceLine = {
  qty: number;
  unit?: string; // "uur"
  description: string;
  unitPrice: number; // positief of negatief (korting)
};

export type VatMode = "standard" | "reverse_charge" | "zero";

export type Invoice = {
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  reference?: string;
  vatMode: VatMode;
  vatRate?: number; // 0.21 or 0.09 when vatMode === "standard"
  lines: InvoiceLine[];
};

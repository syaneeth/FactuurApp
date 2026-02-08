"use client";

import React, { useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePdf } from "../../lib/invoice/InvoicePDF";
import type { Company, Customer, Invoice, InvoiceLine, VatMode } from "../../lib/invoice/types";
import { formatEUR, invoiceSubtotal } from "../../lib/invoice/calc";

function toNumber(v: string) {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export default function InvoicePage() {
  // --- Bedrijf (later uit settings/db) ---
  const company: Company = {
    name: "EDK Installatie",
    legalName: "EDK Installatie",
    address: "Straat 1",
    city: "1000 Gouda",
    country: "Nederland",
    phone: "+32 0 00 00 00",
    email: "info@edk-installatie.nl",
    website: "www.edk-installatie.nl",
    kvk: "99617382",
    vat: "NL00539939B14",
    iban: "NLINGBxxxxxxxxxxxx",
  };

  // --- Klant (later uit klantenlijst/db) ---
  const [customer, setCustomer] = useState<Customer>({
    name: "Bedrijf B.V.",
    attn: "Dhr. J. Janssen",
    address: "Beenhouwersstraat 81",
    city: "1000 Amsterdam",
    country: "Nederland",
    vat: "NL123456789801",
    customerNumber: "D810009",
  });

  // --- Factuur ---
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: "F-001",
    invoiceDate: "2024-01-01",
    dueDate: "2024-01-15",
    reference: "Offerte OF-0013",
    vatMode: "reverse_charge",
    lines: [
      { qty: 8, unit: "uur", description: "Advies en consultancy", unitPrice: 75 },
      { qty: 1, description: "Onderhoud boekhoudsysteem", unitPrice: 25 },
      { qty: 9, description: "T-Shirts 2-zijdig bedrukt", unitPrice: 14 },
      { qty: 1, description: "20% korting", unitPrice: -25.2 },
      { qty: 4, description: "Broeken zonder bedrukking", unitPrice: 29 },
    ],
  });

  const subtotal = useMemo(() => invoiceSubtotal(invoice), [invoice]);

  const addLine = () => {
    const newLine: InvoiceLine = { qty: 1, unit: "", description: "", unitPrice: 0 };
    setInvoice((prev) => ({ ...prev, lines: [...prev.lines, newLine] }));
  };

  const removeLine = (idx: number) => {
    setInvoice((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx),
    }));
  };

  const updateLine = (idx: number, patch: Partial<InvoiceLine>) => {
    setInvoice((prev) => ({
      ...prev,
      lines: prev.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    }));
  };

  const pdfDoc = useMemo(
    () => <InvoicePdf company={company} customer={customer} invoice={invoice} />,
    [company, customer, invoice]
  );

  return (
    <main className="p-6 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Factuur maken</h1>
          <p className="text-sm opacity-70">Regels bewerken + PDF downloaden</p>
        </div>

        <PDFDownloadLink
          document={pdfDoc}
          fileName={`${invoice.invoiceNumber}.pdf`}
          className="rounded-xl border px-4 py-2"
        >
          {({ loading }) => (loading ? "PDF maken..." : "Download PDF")}
        </PDFDownloadLink>
      </div>

      {/* Factuurmeta */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-4 space-y-3">
          <h2 className="font-semibold">Factuur</h2>

          <div className="space-y-1">
            <label className="text-sm opacity-70">Factuurnummer</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={invoice.invoiceNumber}
              onChange={(e) => setInvoice((p) => ({ ...p, invoiceNumber: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm opacity-70">Factuurdatum</label>
            <input
              type="date"
              className="w-full rounded-xl border px-3 py-2"
              value={invoice.invoiceDate}
              onChange={(e) => setInvoice((p) => ({ ...p, invoiceDate: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm opacity-70">Vervaldatum</label>
            <input
              type="date"
              className="w-full rounded-xl border px-3 py-2"
              value={invoice.dueDate}
              onChange={(e) => setInvoice((p) => ({ ...p, dueDate: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm opacity-70">Referentie</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={invoice.reference ?? ""}
              onChange={(e) => setInvoice((p) => ({ ...p, reference: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm opacity-70">BTW modus</label>
            <select
              className="w-full rounded-xl border px-3 py-2"
              value={invoice.vatMode}
              onChange={(e) => setInvoice((p) => ({ ...p, vatMode: e.target.value as VatMode }))}
            >
              <option value="reverse_charge">BTW verlegd</option>
              <option value="zero">0%</option>
              <option value="standard">Standaard (later: 21%/9%)</option>
            </select>
          </div>
        </div>

        {/* Klant */}
        <div className="rounded-2xl border p-4 space-y-3 md:col-span-2">
          <h2 className="font-semibold">Klant</h2>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm opacity-70">Naam</label>
              <input
                className="w-full rounded-xl border px-3 py-2"
                value={customer.name}
                onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm opacity-70">T.a.v.</label>
              <input
                className="w-full rounded-xl border px-3 py-2"
                value={customer.attn ?? ""}
                onChange={(e) => setCustomer((p) => ({ ...p, attn: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm opacity-70">Adres</label>
              <input
                className="w-full rounded-xl border px-3 py-2"
                value={customer.address}
                onChange={(e) => setCustomer((p) => ({ ...p, address: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm opacity-70">Stad + postcode</label>
              <input
                className="w-full rounded-xl border px-3 py-2"
                value={customer.city}
                onChange={(e) => setCustomer((p) => ({ ...p, city: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm opacity-70">Land</label>
              <input
                className="w-full rounded-xl border px-3 py-2"
                value={customer.country}
                onChange={(e) => setCustomer((p) => ({ ...p, country: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm opacity-70">BTW nummer</label>
              <input
                className="w-full rounded-xl border px-3 py-2"
                value={customer.vat ?? ""}
                onChange={(e) => setCustomer((p) => ({ ...p, vat: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm opacity-70">Klantnummer</label>
              <input
                className="w-full rounded-xl border px-3 py-2"
                value={customer.customerNumber ?? ""}
                onChange={(e) => setCustomer((p) => ({ ...p, customerNumber: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Regels */}
      <section className="rounded-2xl border p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Factuurregels</h2>
          <button className="rounded-xl border px-3 py-2" onClick={addLine}>
            + Regel toevoegen
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="opacity-70">
              <tr className="text-left">
                <th className="py-2 pr-2 w-[110px]">Aantal</th>
                <th className="py-2 pr-2">Omschrijving</th>
                <th className="py-2 pr-2 w-[140px] text-right">Prijs/stuk</th>
                <th className="py-2 pr-2 w-[140px] text-right">Bedrag</th>
                <th className="py-2 w-[80px]"></th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((l, idx) => {
                const amount = l.qty * l.unitPrice;
                return (
                  <tr key={idx} className="border-t">
                    <td className="py-2 pr-2">
                      <div className="flex gap-2">
                        <input
                          className="w-[60px] rounded-xl border px-2 py-1"
                          value={String(l.qty)}
                          onChange={(e) => updateLine(idx, { qty: toNumber(e.target.value) })}
                        />
                        <input
                          className="w-[60px] rounded-xl border px-2 py-1"
                          placeholder="uur"
                          value={l.unit ?? ""}
                          onChange={(e) => updateLine(idx, { unit: e.target.value })}
                        />
                      </div>
                    </td>

                    <td className="py-2 pr-2">
                      <input
                        className="w-full rounded-xl border px-2 py-1"
                        placeholder="Omschrijving"
                        value={l.description}
                        onChange={(e) => updateLine(idx, { description: e.target.value })}
                      />
                    </td>

                    <td className="py-2 pr-2 text-right">
                      <input
                        className="w-full rounded-xl border px-2 py-1 text-right"
                        value={String(l.unitPrice)}
                        onChange={(e) => updateLine(idx, { unitPrice: toNumber(e.target.value) })}
                      />
                    </td>

                    <td className="py-2 pr-2 text-right">
                      {formatEUR(amount)}
                    </td>

                    <td className="py-2 text-right">
                      <button
                        className="rounded-xl border px-2 py-1"
                        onClick={() => removeLine(idx)}
                        title="Verwijderen"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full max-w-xs rounded-2xl border p-4 space-y-2">
            <div className="flex justify-between">
              <span className="opacity-70">Subtotaal</span>
              <span>{formatEUR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">
                {invoice.vatMode === "reverse_charge"
                  ? "BTW verlegd"
                  : invoice.vatMode === "zero"
                  ? "BTW 0%"
                  : "BTW (later)"}
              </span>
              <span>{formatEUR(0)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Te betalen</span>
              <span>{formatEUR(subtotal)}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

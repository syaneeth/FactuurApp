"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false }
);

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  { ssr: false }
);
import { InvoicePdf } from "../../lib/invoice/InvoicePDF";
import type {
  Company,
  Customer,
  Invoice,
  InvoiceLine,
  VatMode,
} from "../../lib/invoice/types";
import {
  formatEUR,
  invoiceSubtotal,
  invoiceVatAmount,
  invoiceTotal,
  vatLabel,
} from "../../lib/invoice/calc";

function toNumber(v: string) {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}



function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const buttonPrimary =
  "inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white " +
  "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60";

const buttonSecondary =
  "inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 " +
  "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

const buttonDangerLink =
  "text-sm font-semibold text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md px-2 py-1";

export default function InvoicePage() {
  // --- Bedrijf ---
  const company: Company = {
    name: "EDK Installatie",
    legalName: "EDK Installatie",
    address: "Han Hollanderweg 80",
    city: "2807AG Gouda",
    country: "Nederland",
    phone: "+31684579047",
    email: "miloudbelali@hotmail.com",
    website: "",
    kvk: "99617382",
    vat: "NL005399393B14",
    iban: "NL65INGB0116138696",
  };

  // --- Klant ---
  const [customer, setCustomer] = useState<Customer>({
    name: "EMNA elektra",
    attn: "Dhr. Nazim",
    address: "Plevierstraat 26",
    city: "3145CR Maassluis",
    country: "Nederland",
    vat: "NL126877270B01",
    customerNumber: "D810009",
  });

  // --- Factuur ---
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: "F-001",
    invoiceDate: "2026-02-27",
    dueDate: "2024-01-15",
    reference: "Offerte OF-0013",
    vatMode: "reverse_charge",
    vatRate: 0.21,
    lines: [
      { qty: 73, unit: "uur", description: "Elektra", unitPrice: 40 },
    ],
  });

  // Preview toggle on mobile
  const [showPreview, setShowPreview] = useState(false);


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


  const subtotal = useMemo(() => invoiceSubtotal(invoice), [invoice]);
  const vat = useMemo(() => invoiceVatAmount(invoice), [invoice]);
  const total = useMemo(() => invoiceTotal(invoice), [invoice]);
  
  const vatText = useMemo(() => vatLabel(invoice), [invoice]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Factuur maken</h1>
            <p className="mt-1 text-sm text-gray-600">
              Vul de gegevens in en bekijk rechts meteen hoe de PDF eruitziet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className={buttonSecondary} type="button" onClick={addLine}>
              + Regel toevoegen
            </button>

            {/* Mobile preview toggle */}
            <button
              className={`${buttonSecondary} lg:hidden`}
              type="button"
              onClick={() => setShowPreview((v) => !v)}
            >
              {showPreview ? "Terug naar bewerken" : "Preview bekijken"}
            </button>

            <PDFDownloadLink
              document={pdfDoc}
              fileName={`${invoice.invoiceNumber}.pdf`}
              className={buttonPrimary}
            >
              {({ loading }) => (loading ? "PDF maken..." : "Download PDF")}
            </PDFDownloadLink>
          </div>
        </div>

        {/* Layout: editor + preview */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_520px]">
          {/* Editor column */}
          <div className={`${showPreview ? "hidden" : "block"} lg:block space-y-6`}>
            <div className="grid gap-6 lg:grid-cols-3">
              <SectionCard
                title="Factuurgegevens"
                subtitle="Deze info komt bovenaan je factuur te staan."
              >
                <div className="space-y-4">
                  <Field label="Factuurnummer" hint="Bijv. F-001">
                    <input
                      className={inputBase}
                      value={invoice.invoiceNumber}
                      onChange={(e) =>
                        setInvoice((p) => ({ ...p, invoiceNumber: e.target.value }))
                      }
                      placeholder="F-001"
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Factuurdatum">
                      <input
                        type="date"
                        className={inputBase}
                        value={invoice.invoiceDate}
                        onChange={(e) =>
                          setInvoice((p) => ({ ...p, invoiceDate: e.target.value }))
                        }
                      />
                    </Field>

                    <Field label="Vervaldatum">
                      <input
                        type="date"
                        className={inputBase}
                        value={invoice.dueDate}
                        onChange={(e) =>
                          setInvoice((p) => ({ ...p, dueDate: e.target.value }))
                        }
                      />
                    </Field>
                  </div>

                  <Field label="Referentie" hint="Bijv. offerte nummer (optioneel)">
                    <input
                      className={inputBase}
                      value={invoice.reference ?? ""}
                      onChange={(e) =>
                        setInvoice((p) => ({ ...p, reference: e.target.value }))
                      }
                      placeholder="Offerte OF-0013"
                    />
                  </Field>

                  <Field label="BTW" hint="Kies BTW verlegd/0% of standaard 21%/9%.">
                    <select
                      className={inputBase}
                      value={
                        invoice.vatMode === "standard"
                          ? `standard:${invoice.vatRate ?? 0.21}`
                          : invoice.vatMode
                      }
                      onChange={(e) => {
                        const v = e.target.value;

                        if (v.startsWith("standard:")) {
                          const rate = Number(v.split(":")[1]); // 0.21 or 0.09
                          setInvoice((p) => ({ ...p, vatMode: "standard", vatRate: rate }));
                          return;
                        }

                        // reverse_charge or zero
                        setInvoice((p) => ({
                          ...p,
                          vatMode: v as VatMode,
                          // keep vatRate around or clear it; either is fine
                        }));
                      }}
                    >
                      <option value="reverse_charge">BTW verlegd</option>
                      <option value="zero">0%</option>
                      <option value="standard:0.21">Standaard 21%</option>
                      <option value="standard:0.09">Standaard 9%</option>
                    </select>
                  </Field>
                </div>
              </SectionCard>

              <div className="lg:col-span-2">
                <SectionCard title="Klantgegevens" subtitle="Wie krijgt deze factuur?">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Bedrijfsnaam">
                      <input
                        className={inputBase}
                        value={customer.name}
                        onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Klantbedrijf B.V."
                      />
                    </Field>

                    <Field label="Contactpersoon (t.a.v.)" hint="Optioneel">
                      <input
                        className={inputBase}
                        value={customer.attn ?? ""}
                        onChange={(e) => setCustomer((p) => ({ ...p, attn: e.target.value }))}
                        placeholder="Dhr. / Mevr."
                      />
                    </Field>

                    <Field label="Adres">
                      <input
                        className={inputBase}
                        value={customer.address}
                        onChange={(e) => setCustomer((p) => ({ ...p, address: e.target.value }))}
                        placeholder="Straat + huisnummer"
                      />
                    </Field>

                    <Field label="Postcode + plaats">
                      <input
                        className={inputBase}
                        value={customer.city}
                        onChange={(e) => setCustomer((p) => ({ ...p, city: e.target.value }))}
                        placeholder="1000 Amsterdam"
                      />
                    </Field>

                    <Field label="Land">
                      <input
                        className={inputBase}
                        value={customer.country}
                        onChange={(e) => setCustomer((p) => ({ ...p, country: e.target.value }))}
                        placeholder="Nederland"
                      />
                    </Field>

                    <Field label="BTW-nummer" hint="Optioneel">
                      <input
                        className={inputBase}
                        value={customer.vat ?? ""}
                        onChange={(e) => setCustomer((p) => ({ ...p, vat: e.target.value }))}
                        placeholder="NL123456789B01"
                      />
                    </Field>

                    <Field label="Klantnummer" hint="Optioneel">
                      <input
                        className={inputBase}
                        value={customer.customerNumber ?? ""}
                        onChange={(e) =>
                          setCustomer((p) => ({ ...p, customerNumber: e.target.value }))
                        }
                        placeholder="D810009"
                      />
                    </Field>
                  </div>
                </SectionCard>
              </div>
            </div>

            <SectionCard
              title="Factuurregels"
              subtitle="Voeg producten/diensten toe. Korting? maak een regel met een negatief bedrag."
            >
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-gray-500">
                      <tr className="text-left">
                        <th className="py-2 pr-2 w-[130px]">Aantal</th>
                        <th className="py-2 pr-2">Omschrijving</th>
                        <th className="py-2 pr-2 w-[150px] text-right">Prijs / stuk</th>
                        <th className="py-2 pr-2 w-[150px] text-right">Bedrag</th>
                        <th className="py-2 w-[100px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lines.map((l, idx) => {
                        const amount = l.qty * l.unitPrice;

                        return (
                          <tr key={idx} className="border-t border-gray-100">
                            <td className="py-3 pr-2">
                              <div className="flex gap-2">
                                <input
                                  className={`${inputBase} w-[70px] px-2 py-2`}
                                  inputMode="decimal"
                                  value={String(l.qty)}
                                  onChange={(e) =>
                                    updateLine(idx, { qty: toNumber(e.target.value) })
                                  }
                                />
                                <input
                                  className={`${inputBase} w-[60px] px-2 py-2`}
                                  placeholder="uur"
                                  value={l.unit ?? ""}
                                  onChange={(e) => updateLine(idx, { unit: e.target.value })}
                                />
                              </div>
                            </td>

                            <td className="py-3 pr-2">
                              <input
                                className={inputBase}
                                placeholder="Bijv. installatiewerk, materiaal, uren..."
                                value={l.description}
                                onChange={(e) =>
                                  updateLine(idx, { description: e.target.value })
                                }
                              />
                            </td>

                            <td className="py-3 pr-2 text-right">
                              <input
                                className={`${inputBase} text-right`}
                                inputMode="decimal"
                                value={String(l.unitPrice)}
                                onChange={(e) =>
                                  updateLine(idx, { unitPrice: toNumber(e.target.value) })
                                }
                              />
                            </td>

                            <td className="py-3 pr-2 text-right font-medium text-gray-900">
                              {formatEUR(amount)}
                            </td>

                            <td className="py-3 text-right">
                              <button
                                type="button"
                                className={buttonDangerLink}
                                onClick={() => removeLine(idx)}
                              >
                                Verwijderen
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button className={buttonSecondary} type="button" onClick={addLine}>
                    + Regel toevoegen
                  </button>

                  <div className="text-sm text-gray-600">
                    Subtotaal: <span className="font-semibold">{formatEUR(subtotal)}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    {vatText}: <span className="font-semibold">{formatEUR(vat)}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    Te betalen: <span className="font-semibold">{formatEUR(total)}</span>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Preview column */}
          <div className={`${showPreview ? "block" : "hidden"} lg:block`}>
            <div className="lg:sticky lg:top-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Live preview</h2>
                <PDFDownloadLink
                  document={pdfDoc}
                  fileName={`${invoice.invoiceNumber}.pdf`}
                  className={buttonPrimary}
                >
                  {({ loading }) => (loading ? "PDF..." : "Download")}
                </PDFDownloadLink>
              </div>

              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
                {/* Real PDF viewer */}
                <div className="h-[75vh]">
                  <PDFViewer
                    style={{ width: "100%", height: "100%", border: "none" }}
                    showToolbar
                  >
                    {pdfDoc}
                  </PDFViewer>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Tip: als je een veld aanpast, wordt de preview direct bijgewerkt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

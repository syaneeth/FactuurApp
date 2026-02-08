import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { Company, Customer, Invoice } from "./types";
import { formatEUR, invoiceSubtotal, lineTotal } from "./calc";

const styles = StyleSheet.create({
  logo: {
  width: 140,
  height: "auto",
},

headerLeft: {
  flexDirection: "column",
  justifyContent: "flex-start",
},

headerRight: {
  flexDirection: "column",
  alignItems: "flex-end",
  textAlign: "right",
},
  page: { padding: 32, fontSize: 10 },
  row: { flexDirection: "row" },
  header: { marginBottom: 18 },
  title: { fontSize: 20, fontWeight: 700 },
  block: { marginBottom: 10 },
  col: { flex: 1 },

  metaTable: { marginTop: 10, borderWidth: 1, borderColor: "#ddd" },
  metaRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee" },
  metaCell: { flex: 1, padding: 6 },

  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ddd", paddingBottom: 6, marginTop: 12 },
  th: { fontWeight: 700 },
  tr: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },

  cQty: { width: 60 },
  cDesc: { flex: 1, paddingRight: 8 },
  cUnit: { width: 90, textAlign: "right" },
  cAmt: { width: 90, textAlign: "right" },

  totals: { marginTop: 14, alignSelf: "flex-end", width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  bold: { fontWeight: 700 },

  footer: { marginTop: 16, fontSize: 9, color: "#444" },
});

function fmtDate(iso: string) {
  // simpele NL weergave: DD-MM-YYYY
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

export function InvoicePdf({
  company,
  customer,
  invoice,
}: {
  company: Company;
  customer: Customer;
  invoice: Invoice;
}) {
  const subtotal = invoiceSubtotal(invoice);

  // Voor MVP: BTW-bedrag = 0 bij reverse_charge/zero, anders later toevoegen.
  const vatLabel =
    invoice.vatMode === "reverse_charge"
      ? "BTW verlegd"
      : invoice.vatMode === "zero"
      ? "BTW 0%"
      : "BTW";

  const totalPayable = subtotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={[styles.row, styles.header]}>
          {/* Links: logo + titel */}
          <View style={[styles.col, styles.headerLeft]}>
            <Image src="/logo-edk.png" style={styles.logo} />
            <Text style={[styles.title, { marginTop: 8 }]}>Factuur</Text>
          </View>

          {/* Rechts: bedrijfsgegevens */}
          <View style={[styles.col, styles.headerRight]}>
            <Text>{company.legalName ?? company.name}</Text>
            <Text>{company.address}</Text>
            <Text>{company.city}</Text>
            <Text>{company.country}</Text>
            {company.phone && <Text>{company.phone}</Text>}
            {company.email && <Text>{company.email}</Text>}
            {company.website && <Text>{company.website}</Text>}
          </View>
        </View>


        {/* Addresses */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={{ fontWeight: 700 }}>Van</Text>
            <Text>{company.name}</Text>
            <Text>{company.address}</Text>
            <Text>{company.city}</Text>
            <Text>{company.country}</Text>
            {company.kvk ? <Text>KVK: {company.kvk}</Text> : null}
            {company.vat ? <Text>BTW: {company.vat}</Text> : null}
            {company.iban ? <Text>IBAN: {company.iban}</Text> : null}
          </View>
          <View style={styles.col}>
            <Text style={{ fontWeight: 700 }}>Aan</Text>
            <Text>{customer.name}</Text>
            {customer.attn ? <Text>T.a.v. {customer.attn}</Text> : null}
            <Text>{customer.address}</Text>
            <Text>{customer.city}</Text>
            <Text>{customer.country}</Text>
            {customer.vat ? <Text>BTW Nummer: {customer.vat}</Text> : null}
          </View>
        </View>

        {/* Meta */}
        <View style={styles.metaTable}>
          <View style={styles.metaRow}>
            <View style={styles.metaCell}>
              <Text>Klantnummer</Text>
              <Text style={styles.bold}>{customer.customerNumber ?? "-"}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text>Factuurnummer</Text>
              <Text style={styles.bold}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text>Factuurdatum</Text>
              <Text style={styles.bold}>{fmtDate(invoice.invoiceDate)}</Text>
            </View>
          </View>
          <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
            <View style={styles.metaCell}>
              <Text>Vervaldatum</Text>
              <Text style={styles.bold}>{fmtDate(invoice.dueDate)}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text>Referentie</Text>
              <Text style={styles.bold}>{invoice.reference ?? "-"}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text>{vatLabel}</Text>
              <Text style={styles.bold}>
                {invoice.vatMode === "reverse_charge" ? "Verlegd" : "-"}
              </Text>
            </View>
          </View>
        </View>

        {/* Lines table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.cQty, styles.th]}>Aantal</Text>
          <Text style={[styles.cDesc, styles.th]}>Omschrijving</Text>
          <Text style={[styles.cUnit, styles.th]}>Prijs/stuk</Text>
          <Text style={[styles.cAmt, styles.th]}>Bedrag</Text>
        </View>

        {invoice.lines.map((l, idx) => (
          <View key={idx} style={styles.tr}>
            <Text style={styles.cQty}>
              {l.qty} {l.unit ?? ""}
            </Text>
            <Text style={styles.cDesc}>{l.description}</Text>
            <Text style={styles.cUnit}>{formatEUR(l.unitPrice)}</Text>
            <Text style={styles.cAmt}>{formatEUR(lineTotal(l.qty, l.unitPrice))}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text>Subtotaal</Text>
            <Text>{formatEUR(subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>{vatLabel}</Text>
            <Text>{formatEUR(0)}</Text>
          </View>
          <View style={[styles.totalsRow, styles.bold]}>
            <Text>Te betalen</Text>
            <Text>{formatEUR(totalPayable)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

import { Construction } from "lucide-react";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/admin/PageHeader";

type Props = {
  title: string;
  subtitle?: string;
  blurb: string;
  /** Optional list of feature bullets to preview. */
  features?: string[];
  children?: ReactNode;
};

export function ComingSoonPage({ title, subtitle, blurb, features, children }: Props) {
  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={[{ label: title }]}
      />

      <div className="rounded-2xl border border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-700/30">
          <Construction className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-stone-900">
          Coming in the next module
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-stone-600">{blurb}</p>

        {features && (
          <ul className="mx-auto mt-6 grid max-w-xl gap-2 text-left text-sm text-stone-700 sm:grid-cols-2">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-white px-3 py-2"
              >
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        {children}
      </div>
    </>
  );
}

export function PurchaseOrdersPage() {
  return (
    <ComingSoonPage
      title="Purchase Orders"
      subtitle="Buy stock from your suppliers."
      blurb="Issue POs, track expected arrival dates, and post stock to inventory on receipt."
      features={[
        "Create and email PO PDFs",
        "Per-supplier item lists with cost",
        "Receive partials → auto-update stock",
        "Open / closed / cancelled states",
      ]}
    />
  );
}

export function SalesOrdersPage() {
  return (
    <ComingSoonPage
      title="Sales Orders"
      subtitle="Online customer orders."
      blurb="Pickers and packers will work directly from this queue once the storefront checkout ships."
      features={[
        "Filter by status / channel / customer",
        "Bulk fulfilment + shipping labels",
        "Customer order detail with line items",
        "Refund + restock workflow",
      ]}
    />
  );
}

export function RetailSalesPage() {
  return (
    <ComingSoonPage
      title="Retail Sales"
      subtitle="Counter sales and walk-in transactions."
      blurb="Quick-tap POS for in-person sales: pick the customer (or guest), scan items, take payment, print receipt."
      features={[
        "Scan SKUs / barcode lookup",
        "Cash, UPI, card recording",
        "Daily Z-report summary",
        "Receipt printing + WhatsApp share",
      ]}
    />
  );
}

export function InvoicesPage() {
  return (
    <ComingSoonPage
      title="Invoices"
      subtitle="Tax-compliant billing for customers and businesses."
      blurb="Generated automatically from sales orders and retail sales — search, download PDFs, and re-send to customers."
      features={[
        "GSTIN-aware invoice numbering",
        "PDF download + email re-send",
        "Filter by date range / customer",
        "Mark paid / partial / void",
      ]}
    />
  );
}

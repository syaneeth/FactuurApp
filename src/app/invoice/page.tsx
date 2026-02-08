import dynamic from "next/dynamic";
const InvoiceClient = dynamic(() => import("./InvoiceClient"), { ssr: false });

export default function Page() {
  return <InvoiceClient />;
}

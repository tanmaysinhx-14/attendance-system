import { Suspense } from "react";
import ScannerClient from "./scannerClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center" }}>Loading scanner…</div>}>
      <ScannerClient />
    </Suspense>
  );
}

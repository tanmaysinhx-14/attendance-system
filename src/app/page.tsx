"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";

const Html5Qrcode = dynamic(
  () => import("html5-qrcode").then((m) => m.Html5Qrcode),
  { ssr: false }
);

export default function Home() {
  const qrRef = useRef<any>(null);

  const startScan = async () => {
    const devices = await Html5Qrcode.getCameras();
    qrRef.current = new Html5Qrcode("reader");

    await qrRef.current.start(
      devices[0].id,
      { fps: 10, qrbox: 250 },
      (text: string) => {
        qrRef.current?.stop();
        window.location.href = text;
      }
    );
  };

  return (
    <main style={{ textAlign: "center", padding: 20 }}>
      <h2>Scan Attendance QR</h2>
      <button onClick={startScan}>Start Camera</button>
      <div id="reader" style={{ width: 300, margin: "20px auto" }} />
    </main>
  );
}

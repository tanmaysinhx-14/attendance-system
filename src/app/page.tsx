"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useRef } from "react";

export default function ScanPage() {
  const qrRef = useRef<Html5Qrcode | null>(null);

  const startScan = async () => {
    const devices = await Html5Qrcode.getCameras();
    qrRef.current = new Html5Qrcode("reader");

    await qrRef.current.start(
      devices[0].id,
      { fps: 10, qrbox: 250 },
      (text) => {
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

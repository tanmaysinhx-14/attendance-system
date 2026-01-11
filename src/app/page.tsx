"use client";

import { useRef } from "react";

export default function Home() {
  const qrRef = useRef<any>(null);

  const startScan = async () => {
    // ✅ Browser-only dynamic import
    const { Html5Qrcode } = await import("html5-qrcode");

    const devices = await Html5Qrcode.getCameras();
    if (!devices || devices.length === 0) {
      alert("No camera found");
      return;
    }

    qrRef.current = new Html5Qrcode("reader");

    await qrRef.current.start(
      devices[0].id,
      { fps: 10, qrbox: 250 },
      (decodedText: string) => {
        qrRef.current?.stop();
        window.location.href = decodedText;
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

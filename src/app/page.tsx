"use client";

import { useRef, useState } from "react";

export default function Home() {
  const qrRef = useRef<any>(null);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("Tap Start Camera");

  const startCamera = async () => {
    setStatus("Starting camera...");

    const { Html5Qrcode } = await import("html5-qrcode");
    const devices = await Html5Qrcode.getCameras();

    if (!devices || devices.length === 0) {
      setStatus("No camera found");
      return;
    }

    const rearCamera =
      devices.find((d) =>
        d.label.toLowerCase().includes("back")
      ) || devices[0];

    qrRef.current = new Html5Qrcode("reader");

    await qrRef.current.start(
      rearCamera.id,
      {
        fps: 10,
        qrbox: 250,
        aspectRatio: 1.0
      },
      (text: string) => {
        setStatus("QR detected");

        navigator.vibrate?.(120);

        qrRef.current?.stop();
        window.location.href = text;
      }
    );

    setStarted(true);
    setStatus("Scanning QR code");
  };

  return (
    <main style={{ textAlign: "center", padding: 20 }}>
      <h2>Scan Attendance QR</h2>

      {!started && (
        <button onClick={startCamera}>
          Start Camera
        </button>
      )}

      <div
        id="reader"
        style={{
          width: 300,
          margin: "20px auto",
          border: "2px dashed #555",
          borderRadius: 12
        }}
      />

      <p style={{ fontSize: 14 }}>{status}</p>
    </main>
  );
}
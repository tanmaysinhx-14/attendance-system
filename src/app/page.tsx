"use client";

import { useRef, useState } from "react";

export default function Home() {
  const qrRef = useRef<any>(null);

  const [cameras, setCameras] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [status, setStatus] = useState("Tap Start Camera");

  const startCamera = async (index = 0) => {
    setStatus("Starting camera...");
    const { Html5Qrcode } = await import("html5-qrcode");

    const devices = await Html5Qrcode.getCameras();
    if (!devices || devices.length === 0) {
      setStatus("No camera found");
      return;
    }

    const backIndex =
      devices.findIndex(d =>
        d.label.toLowerCase().includes("back")
      ) !== -1
        ? devices.findIndex(d => d.label.toLowerCase().includes("back"))
        : index;

    setCameras(devices);
    setCurrentIndex(backIndex);

    qrRef.current = new Html5Qrcode("reader");

    await qrRef.current.start(
      devices[backIndex].id,
      { fps: 10, qrbox: 250 },
      (text: string) => {
        if (scanned) return;
        setScanned(true);
        setStatus("QR detected");

        navigator.vibrate?.(120);

        qrRef.current?.stop();
        window.location.href = text;
      }
    );

    setStarted(true);
    setStatus("Scanning QR code");
  };

  const switchCamera = async () => {
    if (switching || cameras.length < 2) return;

    setSwitching(true);
    setStatus("Switching camera...");

    try {
      await qrRef.current.stop();
      await new Promise(r => setTimeout(r, 250));

      const nextIndex = (currentIndex + 1) % cameras.length;
      setCurrentIndex(nextIndex);
      await startCamera(nextIndex);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <main style={{ textAlign: "center", padding: 20 }}>
      <h2>Scan Attendance QR</h2>

      {!started && (
        <button onClick={() => startCamera()}>
          Start Camera
        </button>
      )}

      {started && cameras.length > 1 && (
        <button onClick={switchCamera} disabled={switching}>
          {switching ? "Switching..." : "Switch Camera"}
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
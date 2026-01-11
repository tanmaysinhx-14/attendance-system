"use client";

import { useRef, useState } from "react";

export default function Home() {
  const qrRef = useRef<any>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);

  const startCamera = async (index = 0) => {
    const { Html5Qrcode } = await import("html5-qrcode");

    // Start with any camera first
    const devices = await Html5Qrcode.getCameras();
    if (!devices || devices.length === 0) {
      alert("No camera found");
      return;
    }

    setCameras(devices);
    setCurrentIndex(index);

    qrRef.current = new Html5Qrcode("reader");

    await qrRef.current.start(
      devices[index].id,
      { fps: 10, qrbox: 250 },
      (text: string) => {
        qrRef.current?.stop();
        window.location.href = text;
      }
    );

    setStarted(true);

    // 🔁 Re-fetch cameras AFTER stream starts (mobile fix)
    const refreshed = await Html5Qrcode.getCameras();
    if (refreshed.length > 1) {
      setCameras(refreshed);
    }
  };

  const switchCamera = async () => {
    if (!started || cameras.length < 2) return;

    const nextIndex = (currentIndex + 1) % cameras.length;

    await qrRef.current.stop();
    await startCamera(nextIndex);
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
        <button onClick={switchCamera}>
          Switch Camera ({currentIndex === 0 ? "Front" : "Back"})
        </button>

      )}

      <div id="reader" style={{ width: 300, margin: "20px auto" }} />
    </main>
  );
}

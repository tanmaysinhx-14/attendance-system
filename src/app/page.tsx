"use client";

import { useRef, useState } from "react";

export default function Home() {
  const qrRef = useRef<any>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [currentCam, setCurrentCam] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const loadCameras = async () => {
    const { Html5Qrcode } = await import("html5-qrcode");
    const devices = await Html5Qrcode.getCameras();
    setCameras(devices);
    return { Html5Qrcode, devices };
  };

  const startCamera = async (deviceId?: string) => {
    const { Html5Qrcode, devices } = await loadCameras();

    const camId = deviceId || devices[0].id;
    setCurrentCam(camId);

    qrRef.current = new Html5Qrcode("reader");

    await qrRef.current.start(
      camId,
      { fps: 10, qrbox: 250 },
      (text: string) => {
        qrRef.current?.stop();
        window.location.href = text;
      }
    );

    setStarted(true);
  };

  const switchCamera = async () => {
    if (!started || cameras.length < 2) return;

    const nextCam =
      cameras.find((c) => c.id !== currentCam)?.id || cameras[0].id;

    await qrRef.current.stop();
    await startCamera(nextCam);
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
        <button onClick={switchCamera} style={{ marginLeft: 10 }}>
          Switch Camera
        </button>
      )}

      <div id="reader" style={{ width: 300, margin: "20px auto" }} />
    </main>
  );
}
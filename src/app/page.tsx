"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { queueLocally } from "@/lib/queue";
import { uploadToBackend } from "@/lib/backend-uploader";

export default function Home() {
  const searchParams = useSearchParams();
  const encryptedToken = searchParams.get("token");

  const [usercode, setUsercode] = useState<string | null>(null);
  const [cameraRunning, setCameraRunning] = useState(false);
  const [status, setStatus] = useState("Click Start Camera to begin");

  const qrRef = useRef<any>(null);
  const hasValidToken =
    typeof encryptedToken === "string" &&
    encryptedToken.trim().length > 0;

  
  
  
  
  const lastTokenRef = useRef<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
  if (!encryptedToken || encryptedToken === "") {
    setStatus("Invalid or missing token");
    return;
  }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const res = await fetch(
          `/api/decryption?token=${encodeURIComponent(encryptedToken)}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const text = (await res.text()).trim();
        setUsercode(text);
        setStatus("Ready to scan");
      } catch (e: any) {
        setStatus(e.message || "Token decryption failed");
      }
    })();
  }, []);

  const startCamera = async () => {
    setStatus("Starting camera...");

    const { Html5Qrcode } = await import("html5-qrcode");
    const devices = await Html5Qrcode.getCameras();

    if (!devices.length) {
      setStatus("No camera found");
      return;
    }

    const camera =
      devices.find(d => d.label.toLowerCase().includes("back")) || devices[0];

    qrRef.current = new Html5Qrcode("reader");

    await qrRef.current.start(
      camera.id,
      { fps: 60, qrbox: 250 },
      async text => {
        navigator.vibrate?.(120);
        await queueLocally(text);
        uploadToBackend();
        setStatus("Scan complete");
      }
    );

    setCameraRunning(true);
    setStatus("Scanning QR");
  };

  const stopCamera = async () => {
    if (!qrRef.current) return;

    await qrRef.current.stop();
    await qrRef.current.clear();
    qrRef.current = null;

    setCameraRunning(false);
    setStatus("Stopped");
  };

  return (
    <main style={{ textAlign: "center", padding: 20 }}>
      <input type="text" value={usercode || ""} disabled />
      <p className="mt-7 mb-5 text-2xl/7 font-bold text-white sm:truncate sm:text-3xl sm:tracking-tight">
        Scan Attendance QR
      </p>

      {!cameraRunning && hasValidToken && (
        <button
          className="btn text-black bg-amber-50 rounded-xl px-3 py-1 mt-5 mb-5"
          onClick={startCamera}
        >
          Start Camera
        </button>
      )}

      <div id="reader"
        style={{
          width: 300, margin: "20px auto", border: "2px dashed #555",borderRadius: 12
        }}
      />

      <p style={{ fontSize: 14 }}>{status}</p>

      {cameraRunning && (
        <button className="btn text-black bg-amber-50 rounded-xl px-3 py-1 mt-5 mb-5" onClick={stopCamera}>
          Stop Camera
        </button>
      )}
    </main>
  );
}
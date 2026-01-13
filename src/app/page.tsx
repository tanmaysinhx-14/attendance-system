"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";


export default function Home() {
  const searchParams = useSearchParams();
  const encryptedToken = searchParams.get("token");

  const [usercode, setUsercode] = useState<string | null>(null);
  const [cameraRunning, setCameraRunning] = useState(false);
  const [status, setStatus] = useState("Click Start Camera to begin");

  const qrRef = useRef<Html5Qrcode | null>(null);
  const hasValidToken =
    typeof encryptedToken === "string" &&
    encryptedToken.trim().length > 0;

  const lastTokenRef = useRef<string | null>(null);
  const fetchedRef = useRef(false);

  type JwtPayload = {
    issued_at: number;
    expires_at: number;
  };

  function decodeJwtPayload(token: string): JwtPayload | null {
    try {
      const [, payload] = token.split(".");
      if (!payload) return null;

      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

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
      } catch (e: unknown) {
        if (e instanceof Error) {
          setStatus(e.message);
        } else {
          setStatus("Token decryption failed");
        }
      }
    })();
  }, [encryptedToken]);

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
      async (text: string) => {
        if (lastTokenRef.current === text) return;
        lastTokenRef.current = text;

        const payload = decodeJwtPayload(text);
        if (!payload?.issued_at || !payload?.expires_at) {
          setStatus("Invalid QR code");
          return;
        }

        const now = Math.floor(Date.now() / 1000);
        const MAX_CLOCK_SKEW = 30;

        if (now < payload.issued_at - MAX_CLOCK_SKEW || now > payload.expires_at + MAX_CLOCK_SKEW) {
          setStatus("QR code expired");
          return;
        }

        navigator.vibrate?.(120);
        setStatus("Uploading...");

        try {
          const res = await fetch("/api/databaseUploader", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              scanner: usercode,
              qrToken: text
            }),
            cache: "no-store"
          });

          if (!res.ok) {
            throw new Error(await res.text());
          }

          setStatus("Attendance recorded");
        } catch (err: unknown) {
          if (err instanceof Error) {
            setStatus(err.message);
          } else {
            setStatus("Upload failed");
          }
        }

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
      <p>{usercode || ""}</p>
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

      <div id="reader" style={{width: 300, margin: "20px auto", border: "2px dashed #555", borderRadius: 12}}/>

      <p style={{ fontSize: 14 }}>{status}</p>

      {cameraRunning && (
        <button className="btn text-black bg-amber-50 rounded-xl px-3 py-1 mt-5 mb-5" onClick={stopCamera}>
          Stop Camera
        </button>
      )}
    </main>
  );
}
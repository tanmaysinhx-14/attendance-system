"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

export default function QRGenerator() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);


  const generateQR = async () => {
    setError("");
    setToken(null);
    setSecondsLeft(60);

    try {
      const res = await fetch("/api/generateToken/", {
        cache: "no-store",
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      const jwt = await res.text();
      setToken(jwt.trim());
    } catch (e: any) {
      setError(e.message || "QR generation failed");
    }
  };

  useEffect(() => {
    generateQR();

    const interval = setInterval(() => {
      generateQR();
    }, 20_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!token) return;

    const countdown = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [token]);


return (
  <main style={{minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",background: "#f5f7fb",}}>
    <div
      style={{width: "100%", maxWidth: 350, padding: 24, textAlign: "center", background: "#ffffff", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.08)",}}>
      <h2 style={{marginBottom: 16, fontSize: 20, fontWeight: 600, color: "#1f2937",}}>
        Attendance QR Code
      </h2>

      {error && (
        <p style={{marginBottom: 12, color: "#dc2626", fontSize: 14, fontWeight: 500,}}>
          {error}
        </p>
      )}

      {token && (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: 16, marginBottom: 12, background: "#f9fafb", borderRadius: 10,}}>
          <QRCode value={token} size={220} />
        </div>
      )}

      <p
        style={{fontSize: 13, color: "#6b7280", lineHeight: 1.5,}}>
        This QR code refreshes automatically every 1 minute.
      </p> 

      <p style={{marginTop: 10, fontSize: 13, fontWeight: 500, color: secondsLeft <= 10 ? "#dc2626" : "#374151",}}>
        Expires in {secondsLeft}s
      </p>
    </div>
  </main>
);

}
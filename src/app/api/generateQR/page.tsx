"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import QRCode from "react-qr-code";

export default function QRGenerator() {
  const searchParams = useSearchParams();
  const encryptedToken = searchParams.get("token");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  const generateQR = async () => {
    setError("");
    setToken(null);

    if (!encryptedToken) {
      setError("Missing encrypted token in URL");
      return;
    }

    try {
      const res = await fetch(`/api/generate-token?token=${encodeURIComponent(encryptedToken)}`);

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

  return (
    <main style={{ padding: 20, maxWidth: 400 }}>
      <h2>Generate Attendance QR</h2>

      <input
        placeholder="Student ID"
        value={student}
        onChange={(e) => setStudent(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="Session ID"
        value={session}
        onChange={(e) => setSession(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={generateQR}>Generate QR</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {token && (
        <div style={{ marginTop: 20, background: "#fff", padding: 10 }}>
          <QRCode value={token} size={256} />
          <p style={{ fontSize: 12, wordBreak: "break-all" }}>
            Token valid for a short time
          </p>
        </div>
      )}
    </main>
  );
}

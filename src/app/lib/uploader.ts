import { getQueued, removeQueued } from "./qrQueue";

export async function uploadToBackend() {
  const items = await getQueued();

  for (const item of items) {
    try {
      const res = await fetch("/api/attendance/scan.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_token: item.qrToken,
          client_ts: Math.floor(Date.now() / 1000)
        })
      });

      if (res.ok) {
        await removeQueued(item.id);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
}

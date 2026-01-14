import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  const phpRes = await fetch(
    `http://accounts.careerinstitute.co.in/attendance/php-api/decryption/index.php?token=${encodeURIComponent(
      token
    )}`
  );

  const text = await phpRes.text();

  return new NextResponse(text, {
    status: phpRes.status,
    headers: { "Content-Type": "text/plain" }
  });
}

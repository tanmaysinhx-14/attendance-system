import { NextResponse } from "next/server";

export async function GET(_req: Request) {
  const phpRes = await fetch(
    `http://accounts.careerinstitute.co.in/attendance/php-api/qrTokenGeneration/index.php`
  );

  const text = await phpRes.text();

  return new NextResponse(text, {
    status: phpRes.status,
    headers: { "Content-Type": "text/plain" }
  });
}

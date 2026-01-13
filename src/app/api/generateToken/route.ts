import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const phpRes = await fetch(
    `http://127.0.0.1/accounts/attendance/php-api/qrTokenGeneration/index.php`
  );

  const text = await phpRes.text();

  return new NextResponse(text, {
    status: phpRes.status,
    headers: { "Content-Type": "text/plain" }
  });
}

import { NextResponse } from "next/server";

const PHP_ENDPOINT = "http://127.0.0.1/accounts/attendance/php-api/databaseUploader/index.ph";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(PHP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    return new NextResponse(await res.text(), { status: res.status });
  }

  return NextResponse.json({ success: true });
}

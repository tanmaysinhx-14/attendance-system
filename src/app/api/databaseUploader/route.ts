import { NextResponse } from "next/server";

const PHP_ENDPOINT = "https://accounts.careerinstitute.co.in/attendance/php-api/databaseUploader/index.php";

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

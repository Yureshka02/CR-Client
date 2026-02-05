import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ORDERS_BASE = process.env.API_BASE_URL_ORDERS || "https://re46x5il6j.execute-api.us-east-1.amazonaws.com";

async function getBearerToken(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  return (token as any)?.id_token || (token as any)?.access_token;
}

export async function GET(req: Request) {
  const bearer = await getBearerToken(req);
  if (!bearer) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const r = await fetch(`${ORDERS_BASE}/orders/list`, {
      method: "GET",
      headers: { Authorization: `Bearer ${bearer}` },
      cache: "no-store",
    });
    const text = await r.text();
    return new NextResponse(text, { status: r.status, headers: r.headers });
  } catch (e: any) {
    return NextResponse.json({ message: "Error", error: String(e) }, { status: 502 });
  }
}
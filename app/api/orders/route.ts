import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ORDERS_BASE = process.env.API_BASE_URL_ORDERS || "https://re46x5il6j.execute-api.us-east-1.amazonaws.com";

function upstreamUrl(path: string) {
  return `${ORDERS_BASE.replace(/\/+$/, "")}${path}`;
}

async function getBearerToken(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  return (token as any)?.id_token || (token as any)?.access_token;
}

async function fetchWithTimeout(input: RequestInfo, init: RequestInit, ms = 30000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function POST(req: Request) {
  const bearer = await getBearerToken(req);
  if (!bearer) return NextResponse.json({ message: "Unauthorized (no session token)" }, { status: 401 });

  const body = await req.text();

  try {
    const r = await fetchWithTimeout(upstreamUrl("/orders"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearer}`,
        "Content-Type": "application/json",
      },
      body,
    });

    const text = await r.text();
    return new NextResponse(text, { status: r.status, headers: r.headers });
  } catch (e: any) {
    return NextResponse.json(
      { message: "Upstream request failed", error: String(e?.message ?? e), upstream: upstreamUrl("/orders") },
      { status: 502 }
    );
  }
}

export async function GET(req: Request) {
  const bearer = await getBearerToken(req);
  if (!bearer) return NextResponse.json({ message: "Unauthorized (no session token)" }, { status: 401 });

  try {
    const r = await fetchWithTimeout(upstreamUrl("/orders"), {
      method: "GET",
      headers: { Authorization: `Bearer ${bearer}` },
      cache: "no-store",
    });

    const text = await r.text();
    return new NextResponse(text, { status: r.status, headers: r.headers });
  } catch (e: any) {
    return NextResponse.json(
      { message: "Upstream request failed", error: String(e?.message ?? e), upstream: upstreamUrl("/orders") },
      { status: 502 }
    );
  }
}

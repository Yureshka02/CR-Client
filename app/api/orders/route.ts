import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ORDERS_BASE = process.env.API_BASE_URL_ORDERS || "https://re46x5il6j.execute-api.us-east-1.amazonaws.com";

function upstreamUrl(path: string) {
  return `${ORDERS_BASE.replace(/\/+$/, "")}${path}`;
}

async function bearerFromSession(req: Request) {
  const t = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  const idToken = (t as any)?.id_token as string | undefined;
  const accessToken = (t as any)?.access_token as string | undefined;

  return { idToken, accessToken };
}

export async function GET(req: Request) {
  const { idToken, accessToken } = await bearerFromSession(req);

  if (!idToken && !accessToken) {
    return NextResponse.json(
      {
        message: "No token found in NextAuth session cookie",
        hint: "Check NEXTAUTH_URL/NEXTAUTH_SECRET, trustHost:true, and that login completed on this domain.",
      },
      { status: 401 }
    );
  }

  const bearer = idToken || accessToken!;
  const r = await fetch(upstreamUrl("/orders"), {
    headers: { Authorization: `Bearer ${bearer}` },
    cache: "no-store",
  });

  const text = await r.text();
  return new NextResponse(text, { status: r.status, headers: r.headers });
}

export async function POST(req: Request) {
  const { idToken, accessToken } = await bearerFromSession(req);

  if (!idToken && !accessToken) {
    return NextResponse.json(
      { message: "No token found in session cookie" },
      { status: 401 }
    );
  }

  const bearer = accessToken || idToken!;
  const body = await req.text();

  const r = await fetch(upstreamUrl("/orders"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
    },
    body,
  });

  const text = await r.text();
  return new NextResponse(text, { status: r.status, headers: r.headers });
}

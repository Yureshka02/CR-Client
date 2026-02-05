import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ORDERS_BASE = "https://re46x5il6j.execute-api.us-east-1.amazonaws.com";

function upstreamUrl(path: string) {
  return `${ORDERS_BASE.replace(/\/+$/, "")}${path}`;
}

async function getBearerToken(req: Request) {
  // Reads NextAuth token from cookies and returns Cognito id_token
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const idToken = (token as any)?.id_token as string | undefined;
  const accessToken = (token as any)?.access_token as string | undefined;

  // Prefer id_token if your API Gateway authorizer expects it; otherwise access_token also works in many setups.
  return idToken || accessToken;
}

export async function GET(req: Request) {
  const bearer = await getBearerToken(req);
  if (!bearer) {
    return NextResponse.json({ message: "Unauthorized (no token in session)" }, { status: 401 });
  }

  const r = await fetch(upstreamUrl("/orders"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${bearer}`,
    },
    cache: "no-store",
  });

  const text = await r.text();
  return new NextResponse(text, { status: r.status, headers: r.headers });
}

export async function POST(req: Request) {
  const bearer = await getBearerToken(req);
  if (!bearer) {
    return NextResponse.json({ message: "Unauthorized (no token in session)" }, { status: 401 });
  }

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

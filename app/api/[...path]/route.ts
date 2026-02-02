import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PRIMARY = process.env.API_BASE_URL_PRIMARY!;
const SECONDARY = process.env.API_BASE_URL_SECONDARY!;

function join(base: string, pathParts: string[]) {
  const p = pathParts.join("/");
  return `${base.replace(/\/+$/, "")}/${p.replace(/^\/+/, "")}`;
}

async function forward(req: Request, targetBase: string) {
  const url = new URL(req.url);
  const pathParts = url.pathname.replace(/^\/api\//, "").split("/");
  const upstream = join(targetBase, pathParts);

  // Clone headers
  const headers = new Headers(req.headers);
  headers.delete("host");

  // Attach Bearer token automatically (if user is logged in)
  // Works on Vercel because getToken reads NextAuth cookies.
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const idToken = (token as any)?.id_token;
  if (idToken) {
    headers.set("Authorization", `Bearer ${idToken}`);
  } else {
    // If no token, ensure we don't accidentally send an empty Authorization header
    headers.delete("Authorization");
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.text(),
    redirect: "manual",
  };

  return fetch(upstream, init);
}

async function handler(req: Request) {
  try {
    const r1 = await forward(req, PRIMARY);

    // Don't failover on 4xx (auth/validation errors)
    if (r1.ok || (r1.status >= 400 && r1.status < 500)) {
      return new NextResponse(await r1.text(), { status: r1.status, headers: r1.headers });
    }
  } catch {
    // network error => failover
  }

  const r2 = await forward(req, SECONDARY);
  return new NextResponse(await r2.text(), { status: r2.status, headers: r2.headers });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;

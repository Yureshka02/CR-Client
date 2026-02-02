import { NextResponse } from "next/server";

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

  const headers = new Headers(req.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.text(),
    redirect: "manual",
  };

  return fetch(upstream, init);
}

async function handler(req: Request) {
  // Try primary
  try {
    const r1 = await forward(req, PRIMARY);

    // Don't failover on 4xx (auth/validation errors)
    if (r1.ok || (r1.status >= 400 && r1.status < 500)) {
      return new NextResponse(await r1.text(), { status: r1.status, headers: r1.headers });
    }
  } catch {
    // network error => failover
  }

  // Try secondary
  const r2 = await forward(req, SECONDARY);
  return new NextResponse(await r2.text(), { status: r2.status, headers: r2.headers });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;

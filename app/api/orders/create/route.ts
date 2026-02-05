import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ORDERS_BACKEND = "http://13.221.230.193:8080";

async function getUserSub(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  return token?.sub as string | undefined;
}

export async function POST(req: Request) {
  try {
    const userSub = await getUserSub(req);
    if (!userSub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.text();

    const r = await fetch(`${ORDERS_BACKEND}/orders/create`, {
      method: "POST",
      headers: {
        "x-user-sub": userSub,
        "Content-Type": "application/json",
      },
      body,
    });

    const text = await r.text();
    return new NextResponse(text, { 
      status: r.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    console.error("Orders create error:", e);
    return NextResponse.json(
      { message: "Error creating order", error: String(e) }, 
      { status: 502 }
    );
  }
}
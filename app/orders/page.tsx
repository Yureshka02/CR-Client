"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function OrdersPage() {
  const { status } = useSession();
  const [resp, setResp] = useState<any>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      const r = await fetch("/api/orders", { cache: "no-store" });
      const t = await r.text();
      setResp({ status: r.status, body: tryJson(t) ?? t });
    })();
  }, [status]);

  if (status === "loading") return <div style={{ padding: 24 }}>Loading…</div>;
  if (status !== "authenticated")
    return (
      <div style={{ padding: 24 }}>
        <p>Login required.</p>
        <button onClick={() => signIn("cognito")}>Login</button>
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      <h1>My Orders</h1>
      <pre style={{ background: "#111827", color: "#10b981", padding: 16, borderRadius: 8 }}>
        {JSON.stringify(resp, null, 2)}
      </pre>
    </div>
  );
}

function tryJson(t: string) {
  try { return JSON.parse(t); } catch { return null; }
}

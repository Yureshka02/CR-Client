"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [ordersResp, setOrdersResp] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/orders");
      const t = await r.text();
      setOrdersResp({ status: r.status, body: t });
    })();
  }, [status]);

  return (
    <main style={{ padding: 24 }}>
      <h1>CloudRetail</h1>

      {status === "authenticated" ? (
        <>
          <p>Logged in ✅</p>
          <button onClick={() => signOut()}>Logout</button>
        </>
      ) : (
        <>
          <p>Not logged in</p>
          <button onClick={() => signIn("cognito")}>Login</button>
        </>
      )}

      <h2>/orders via proxy</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(ordersResp, null, 2)}
      </pre>
    </main>
  );
}

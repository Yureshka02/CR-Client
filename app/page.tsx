"use client";

import { useEffect, useState } from "react";

async function fetchJson(path: string) {
  const res = await fetch(path, { cache: "no-store" });
  const text = await res.text();

  try {
    return { ok: true, status: res.status, data: JSON.parse(text) };
  } catch {
    // If backend returned HTML/error text, show it
    return { ok: false, status: res.status, text };
  }
}

export default function Home() {
  const [catalog, setCatalog] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);

  useEffect(() => {
    (async () => {
      // IMPORTANT: match your current endpoints:
      // catalog has /health, inventory & orders do NOT
      const c = await fetchJson("/api/health");
      const i = await fetchJson("/api/inventory");
      const o = await fetchJson("/api/orders");

      setCatalog(c);
      setInventory(i);
      setOrders(o);
    })().catch((e) => {
      setCatalog({ ok: false, error: String(e) });
      setInventory({ ok: false, error: String(e) });
      setOrders({ ok: false, error: String(e) });
    });
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>CloudRetail Frontend</h1>

      <h2>Catalog</h2>
      <pre>{catalog ? JSON.stringify(catalog, null, 2) : "Loading..."}</pre>

      <h2>Inventory</h2>
      <pre>{inventory ? JSON.stringify(inventory, null, 2) : "Loading..."}</pre>

      <h2>Orders</h2>
      <pre>{orders ? JSON.stringify(orders, null, 2) : "Loading..."}</pre>
    </main>
  );
}

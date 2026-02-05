"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type AvailableItem = {
  sku: string;
  stock?: number;
  price?: number;
  updatedAt?: string;
};

type OrderPayload = {
  sku: string;
  qty: number;
  shippingAddress?: string;
  phone?: string;
};

export default function Page() {
  const { status } = useSession();

  // ---- state ----
  const [ordersResp, setOrdersResp] = useState<any>(null);
  const [availableResp, setAvailableResp] = useState<any>(null);

  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([]);
  const [selectedSku, setSelectedSku] = useState<string>("");
  const [qty, setQty] = useState<number>(1);

  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [placing, setPlacing] = useState(false);
  const [placeResult, setPlaceResult] = useState<any>(null);

  const isAuthed = status === "authenticated";

  // ---- fetch helpers ----
  async function fetchOrders() {
    const r = await fetch("/api/orders/list", { cache: "no-store" });
    const t = await r.text();
    setOrdersResp({ status: r.status, body: safeJson(t) ?? t });
  }

  async function fetchAvailable() {
    // expects your inventory service exposes /inventory/available
    const r = await fetch("/api/inventory/available", { cache: "no-store" });
    const t = await r.text();
    const j = safeJson(t);
    setAvailableResp({ status: r.status, body: j ?? t });

    if (r.ok && Array.isArray(j)) {
      setAvailableItems(j);
      if (!selectedSku && j[0]?.sku) setSelectedSku(j[0].sku);
    }
  }

  // initial loads
  useEffect(() => {
    fetchAvailable().catch((e) => setAvailableResp({ status: "ERR", body: String(e) }));
  }, []);

  useEffect(() => {
    // only fetch orders when auth state is known
    if (status === "authenticated") {
      fetchOrders().catch((e) => setOrdersResp({ status: "ERR", body: String(e) }));
    } else if (status === "unauthenticated") {
      setOrdersResp({ status: 401, body: "Login required to view /orders" });
    }
  }, [status]);

  const selectedItem = useMemo(
    () => availableItems.find((i) => i.sku === selectedSku),
    [availableItems, selectedSku]
  );

  async function placeOrder() {
    if (!isAuthed) {
      setPlaceResult({ ok: false, message: "Please login first." });
      return;
    }
    if (!selectedSku) {
      setPlaceResult({ ok: false, message: "Select a SKU first." });
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      setPlaceResult({ ok: false, message: "Quantity must be >= 1." });
      return;
    }

    const payload: OrderPayload = {
      sku: selectedSku,
      qty,
      shippingAddress: shippingAddress || undefined,
      phone: phone || undefined,
    };

    setPlacing(true);
    setPlaceResult(null);

    try {
      const r = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const t = await r.text();
      const j = safeJson(t) ?? t;

      setPlaceResult({ status: r.status, body: j });

      // refresh: orders and available inventory
      if (r.ok) {
        await fetchOrders();
        await fetchAvailable();
      }
    } catch (e: any) {
      setPlaceResult({ status: "ERR", body: String(e?.message ?? e) });
    } finally {
      setPlacing(false);
    }
  }

  // ---- Modern Styling Constants (kept from your page) ----
  const containerStyle: React.CSSProperties = {
    padding: "40px 20px",
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    color: "#111827",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "24px",
  };

  const buttonStyle = (isPrimary: boolean): React.CSSProperties => ({
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: isPrimary ? "#2563eb" : "#ef4444",
    color: "white",
    fontSize: "14px",
    transition: "opacity 0.2s",
  });

  const secondaryBtn: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    fontWeight: 600,
  };

  const linkButtonStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 24px",
    borderRadius: "6px",
    backgroundColor: "#10b981",
    color: "white",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "14px",
    transition: "opacity 0.2s",
  };

  const preStyle: React.CSSProperties = {
    backgroundColor: "#1f2937",
    color: "#10b981",
    padding: "16px",
    borderRadius: "8px",
    overflowX: "auto",
    fontSize: "13px",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.9rem",
    color: "#374151",
    fontWeight: 600,
    marginBottom: 6,
    display: "block",
  };

  return (
    <main style={containerStyle}>
      <header style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "32px", paddingBottom: "16px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#1e40af", margin: 0 }}>
          CloudRetail
        </h1>
        <p style={{ color: "#6b7280", marginTop: "8px" }}>E-commerce Management Platform</p>
      </header>

      {/* Navigation Card */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "16px", color: "#374151" }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/inventory" style={linkButtonStyle}>
            📦 Manage Inventory
          </Link>
          <Link href="/orders/list" style={{ ...linkButtonStyle, backgroundColor: "#8b5cf6" }}>
            🛒 View Orders
          </Link>
          <button style={secondaryBtn} onClick={() => fetchAvailable()}>
            🔄 Refresh Available Items
          </button>
          <button style={secondaryBtn} onClick={() => fetchOrders()} disabled={!isAuthed}>
            🔄 Refresh My Orders
          </button>
        </div>
      </section>

      {/* Session */}
      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div style={{ flexGrow: 1 }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "1.25rem" }}>Session Status</h2>
            {status === "authenticated" ? (
              <p style={{ color: "#059669", fontWeight: 500, margin: 0 }}>Logged in ✅</p>
            ) : status === "loading" ? (
              <p style={{ color: "#6b7280", fontWeight: 500, margin: 0 }}>Checking session…</p>
            ) : (
              <p style={{ color: "#6b7280", fontWeight: 500, margin: 0 }}>Not logged in</p>
            )}
          </div>

          <div>
            {status === "authenticated" ? (
              <button style={buttonStyle(false)} onClick={() => signOut()}>
                Logout
              </button>
            ) : (
              <button style={buttonStyle(true)} onClick={() => signIn("cognito")}>
                Login with Cognito
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Available inventory */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "8px", color: "#374151" }}>
          🟢 Available Inventory (stock &gt; 0)
        </h2>
        <p style={{ marginTop: 0, color: "#6b7280" }}>
          This list should only contain purchasable items from <code>InventoryTable</code>.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Select SKU</label>
            <select
              style={inputStyle}
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
            >
              {availableItems.length === 0 ? (
                <option value="">No available items</option>
              ) : (
                availableItems.map((it) => (
                  <option key={it.sku} value={it.sku}>
                    {it.sku} {typeof it.stock === "number" ? `(stock: ${it.stock})` : ""}
                  </option>
                ))
              )}
            </select>

            {selectedItem && (
              <div style={{ marginTop: 10, fontSize: 14, color: "#374151" }}>
                <div><b>Stock:</b> {selectedItem.stock ?? "?"}</div>
                <div><b>Price:</b> {selectedItem.price ?? "?"}</div>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Quantity</label>
            <input
              style={inputStyle}
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <div>
                <label style={labelStyle}>Shipping address (PII)</label>
                <input
                  style={inputStyle}
                  placeholder="No.1 Street, City"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone (PII)</label>
                <input
                  style={inputStyle}
                  placeholder="07XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            style={{ ...buttonStyle(true), opacity: placing ? 0.7 : 1 }}
            onClick={placeOrder}
            disabled={placing || !selectedSku}
          >
            {placing ? "Placing Order…" : "✅ Place Order"}
          </button>

          <span style={{ color: "#6b7280", fontSize: 14 }}>
            {isAuthed ? "Orders require login (JWT)." : "Login required to place an order."}
          </span>
        </div>

        {placeResult && (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ margin: "0 0 8px 0" }}>Order Result</h3>
            <pre style={preStyle}>{JSON.stringify(placeResult, null, 2)}</pre>
          </div>
        )}

        <details style={{ marginTop: 16 }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Debug: /inventory/available raw</summary>
          <pre style={{ ...preStyle, marginTop: 10 }}>{JSON.stringify(availableResp, null, 2)}</pre>
        </details>
      </section>

      {/* Orders */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "#374151" }}>
          🔒 Protected API: <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>/orders/list</code>
        </h2>
        <pre style={preStyle}>{JSON.stringify(ordersResp, null, 2)}</pre>
      </section>
    </main>
  );
}

function safeJson(t: string) {
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}
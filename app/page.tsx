"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Page() {
  const { status } = useSession();
  const [ordersResp, setOrdersResp] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/orders");
      const t = await r.text();
      setOrdersResp({ status: r.status, body: t });
    })();
  }, [status]);

  // Modern Styling Constants
  const containerStyle: React.CSSProperties = {
    padding: "40px 20px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    color: "#111827"
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "24px"
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
    transition: "opacity 0.2s"
  });

  const preStyle: React.CSSProperties = {
    backgroundColor: "#1f2937",
    color: "#10b981",
    padding: "16px",
    borderRadius: "8px",
    overflowX: "auto",
    fontSize: "13px",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap"
  };

  return (
    <main style={containerStyle}>
      <header style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "32px", paddingBottom: "16px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#1e40af", margin: 0 }}>
          CloudRetail
        </h1>
      </header>

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "between", alignItems: "center", width: "100%" }}>
          <div style={{ flexGrow: 1 }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "1.25rem" }}>Session Status</h2>
            {status === "authenticated" ? (
              <p style={{ color: "#059669", fontWeight: 500, margin: 0 }}>Logged in ✅</p>
            ) : (
              <p style={{ color: "#6b7280", fontWeight: 500, margin: 0 }}>Not logged in</p>
            )}
          </div>
          
          <div>
            {status === "authenticated" ? (
              <button style={buttonStyle(false)} onClick={() => signOut()}>Logout</button>
            ) : (
              <button style={buttonStyle(true)} onClick={() => signIn("cognito")}>Login with Cognito</button>
            )}
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "#374151" }}>
          Protected API: <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>/orders</code>
        </h2>
        <pre style={preStyle}>
          {JSON.stringify(ordersResp, null, 2)}
        </pre>
      </section>
    </main>
  );
}
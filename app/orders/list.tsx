'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = 'https://re46x5il6j.execute-api.us-east-1.amazonaws.com';

type Order = {
  userId: string;
  createdAtOrderId: string;
  orderId: string;
  sku: string;
  qty: number;
  status: string;
  priceAtPurchase?: number;
  createdAt: string;
  shippingAddress?: string;
  phone?: string;
};

export default function OrdersListPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAuthed = status === "authenticated";

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, session]);

  async function fetchOrders() {
    setLoading(true);
    setError('');

    try {
      const idToken = (session as any)?.id_token;
      const headers: Record<string, string> = idToken 
        ? { 'Authorization': `Bearer ${idToken}` }
        : {};

      const r = await fetch(`${API_URL}/orders/list`, {
        cache: "no-store",
        headers,
      });

      if (r.ok) {
        const data = await r.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        const errorData = await r.text();
        setError(`Error ${r.status}: ${errorData}`);
      }
    } catch (e) {
      setError('Failed to fetch orders: ' + String(e));
    } finally {
      setLoading(false);
    }
  }

  const containerStyle: React.CSSProperties = {
    padding: "40px 20px",
    maxWidth: "1200px",
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
    textAlign: "center",
  };

  const orderCardStyle: React.CSSProperties = {
    backgroundColor: "#f9fafb",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    marginBottom: "16px",
    transition: "all 0.2s",
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: status === "PLACED" ? "#dbeafe" : "#e5e7eb",
    color: status === "PLACED" ? "#1e40af" : "#374151",
  });

  if (!isAuthed) {
    return (
      <main style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={{ fontSize: "2rem", marginBottom: "16px" }}>🔒 Authentication Required</h1>
          <p style={{ marginBottom: "24px", color: "#6b7280" }}>
            Please login to view your orders.
          </p>
          <button style={buttonStyle(true)} onClick={() => signIn("cognito")}>
            Login with Cognito
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={containerStyle}>
      <header style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "32px", paddingBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#1e40af", margin: 0 }}>
              My Orders
            </h1>
            <p style={{ color: "#6b7280", marginTop: "8px" }}>View all your order history</p>
          </div>
          <button style={buttonStyle(false)} onClick={() => signOut()}>
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <section style={cardStyle}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/" style={linkButtonStyle}>
            🏠 Home
          </Link>
          <Link href="/inventory" style={{ ...linkButtonStyle, backgroundColor: "#8b5cf6" }}>
            📦 Manage Inventory
          </Link>
          <button 
            style={{ 
              padding: "12px 24px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
            onClick={fetchOrders}
            disabled={loading}
          >
            {loading ? "🔄 Refreshing..." : "🔄 Refresh Orders"}
          </button>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
          color: "#991b1b",
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Orders List */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", color: "#374151" }}>
          Order History ({orders.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⏳</div>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📦</div>
            <p>No orders yet. Start shopping!</p>
            <Link href="/" style={{ ...linkButtonStyle, marginTop: "16px", display: "inline-block" }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div>
            {orders.map((order) => (
              <div 
                key={order.orderId} 
                style={orderCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  e.currentTarget.style.borderColor = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#111827" }}>
                      {order.sku}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "4px 0 0 0" }}>
                      Order ID: {order.orderId}
                    </p>
                  </div>
                  <span style={statusBadgeStyle(order.status)}>
                    {order.status}
                  </span>
                </div>

                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                  gap: "16px",
                  marginTop: "16px",
                }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0, textTransform: "uppercase", fontWeight: 600 }}>
                      Quantity
                    </p>
                    <p style={{ fontSize: "1.125rem", fontWeight: 600, margin: "4px 0 0 0", color: "#111827" }}>
                      {order.qty} units
                    </p>
                  </div>

                  {order.priceAtPurchase && (
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0, textTransform: "uppercase", fontWeight: 600 }}>
                        Price
                      </p>
                      <p style={{ fontSize: "1.125rem", fontWeight: 600, margin: "4px 0 0 0", color: "#111827" }}>
                        ${order.priceAtPurchase.toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0, textTransform: "uppercase", fontWeight: 600 }}>
                      Order Date
                    </p>
                    <p style={{ fontSize: "1.125rem", fontWeight: 600, margin: "4px 0 0 0", color: "#111827" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "2px 0 0 0" }}>
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {order.priceAtPurchase && (
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0, textTransform: "uppercase", fontWeight: 600 }}>
                        Total
                      </p>
                      <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: "4px 0 0 0", color: "#2563eb" }}>
                        ${(order.priceAtPurchase * order.qty).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {(order.shippingAddress || order.phone) && (
                  <div style={{ 
                    marginTop: "16px", 
                    paddingTop: "16px", 
                    borderTop: "1px solid #e5e7eb",
                  }}>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0 0 8px 0", textTransform: "uppercase", fontWeight: 600 }}>
                      Shipping Details
                    </p>
                    {order.shippingAddress && (
                      <p style={{ fontSize: "0.875rem", margin: "4px 0", color: "#374151" }}>
                        📍 {order.shippingAddress}
                      </p>
                    )}
                    {order.phone && (
                      <p style={{ fontSize: "0.875rem", margin: "4px 0", color: "#374151" }}>
                        📞 {order.phone}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
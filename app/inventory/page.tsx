'use client';

import { useState } from 'react';
import './Inventory.css'; // Import the stylesheet

const API_URL = 'https://re46x5il6j.execute-api.us-east-1.amazonaws.com';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [searchSku, setSearchSku] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/inventory/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, stock: parseInt(stock), price: parseFloat(price) }),
      });
      if (response.ok) alert('Success!');
      else setError('Failed to create');
    } catch (err) { setError('Error'); }
    finally { setLoading(false); }
  };

  return (
    <main className="inventory-main">
      <div className="inventory-container">
        
        <header className="inventory-header">
          <h1 className="inventory-title">
            <span className="gradient-text">Inventory</span> Central
          </h1>
          <p className="inventory-subtitle">Real-time stock management powered by AWS.</p>
        </header>

        <div className="inventory-grid">
          {/* Create Section */}
          <section className="inventory-card">
            <h2 className="card-title">➕ Create New Item</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="input-label">SKU Identifier</label>
                <input 
                  className="input-field" 
                  value={sku} 
                  onChange={(e) => setSku(e.target.value.toUpperCase())} 
                  placeholder="LAPTOP-001" 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Stock</label>
                  <input className="input-field" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Price</label>
                  <input className="input-field" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Deploy to Inventory'}
              </button>
            </form>
          </section>

          {/* Lookup Section */}
          <section className="inventory-card">
            <h2 className="card-title">🔍 Inventory Lookup</h2>
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <input 
                className="input-field" 
                style={{ paddingRight: '100px' }} 
                value={searchSku} 
                onChange={(e) => setSearchSku(e.target.value.toUpperCase())} 
                placeholder="Search SKU..." 
              />
              <button className="btn-search" style={{ position: 'absolute', right: '5px', top: '5px', bottom: '5px' }}>
                Search
              </button>
            </div>

            {items.map(item => (
              <div key={item.sku} className="item-result-card">
                <span className={`badge ${item.stock > 0 ? 'badge-green' : 'badge-red'}`}>
                  {item.stock} Available
                </span>
                <h3>{item.sku}</h3>
                <div className="diag-grid" style={{ marginTop: '1rem' }}>
                  <div className="inventory-card" style={{ padding: '0.5rem', textAlign: 'center' }}>
                    <small>Price</small>
                    <div>${item.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Diagnostics */}
        <footer className="diagnostics-panel">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>⚡ Developer Diagnostics</h2>
          <div className="diag-grid">
            <button className="diag-btn">🏥 Health Check</button>
            <button className="diag-btn">📡 Ping Test</button>
            <button className="diag-btn">🌐 Raw JSON</button>
            <button className="diag-btn">📋 Copy URL</button>
          </div>
        </footer>

      </div>
    </main>
  );
}
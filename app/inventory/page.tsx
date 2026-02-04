'use client';

import { useState } from 'react';

const API_URL = 'https://re46x5il6j.execute-api.us-east-1.amazonaws.com';

interface InventoryItem {
  sku: string;
  stock: number;
  price?: number;
  updatedAt?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [searchSku, setSearchSku] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/inventory/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: sku,
          stock: parseInt(stock),
          price: price ? parseFloat(price) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Item ${data.sku} created successfully!`);
        setSku('');
        setStock('');
        setPrice('');
        if (searchSku === sku) {
          await fetchItem(sku);
        }
      } else {
        setError(data.message || 'Failed to create item');
      }
    } catch (err) {
      setError('Error creating item: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const fetchItem = async (itemSku: string) => {
    if (!itemSku) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/inventory/${itemSku}`);
      
      if (response.ok) {
        const data = await response.json();
        setItems([data]);
      } else if (response.status === 404) {
        setError(`Item "${itemSku}" not found`);
        setItems([]);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to fetch item');
        setItems([]);
      }
    } catch (err) {
      setError('Error fetching item: ' + err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItem(searchSku);
  };

  const handleReserve = async (itemSku: string, qty: number) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/inventory/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: itemSku, qty: qty }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Reserved ${qty} units of ${itemSku}`);
        await fetchItem(itemSku);
      } else {
        setError(data.message || 'Failed to reserve stock');
      }
    } catch (err) {
      setError('Error reserving stock: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .inventory-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          margin-bottom: 3rem;
          color: white;
        }
        
        .header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .header p {
          font-size: 1.1rem;
          opacity: 0.9;
        }
        
        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        
        @media (min-width: 768px) {
          .grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        .card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          overflow: hidden;
          transition: transform 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
        }
        
        .card-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          color: white;
        }
        
        .card-header.green {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }
        
        .card-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .card-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.95rem;
        }
        
        .card-body {
          padding: 2rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 1rem;
          color: #111827;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .form-input::placeholder {
          color: #9ca3af;
        }
        
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .btn {
          width: 100%;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
        
        .btn-primary:hover:not(:disabled) {
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
          transform: translateY(-2px);
        }
        
        .btn-success {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          box-shadow: 0 10px 30px rgba(17, 153, 142, 0.4);
        }
        
        .btn-success:hover:not(:disabled) {
          box-shadow: 0 15px 40px rgba(17, 153, 142, 0.5);
          transform: translateY(-2px);
        }
        
        .error-box {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
        }
        
        .error-title {
          font-weight: 600;
          color: #991b1b;
          margin: 0 0 0.25rem 0;
        }
        
        .error-text {
          color: #b91c1c;
          font-size: 0.875rem;
          margin: 0;
        }
        
        .item-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 2px solid #dee2e6;
          border-radius: 15px;
          padding: 1.5rem;
          transition: all 0.3s;
        }
        
        .item-card:hover {
          border-color: #667eea;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .item-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }
        
        .item-date {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        
        .stock-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 700;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .stock-high {
          background: #d1fae5;
          color: #065f46;
        }
        
        .stock-medium {
          background: #fef3c7;
          color: #92400e;
        }
        
        .stock-low {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .price-box {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        
        .price-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.05em;
          margin: 0;
        }
        
        .price-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0.5rem 0 0 0;
        }
        
        .btn-group {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.5rem;
        }
        
        .btn-reserve {
          padding: 0.75rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }
        
        .btn-reserve:hover:not(:disabled) {
          background: #667eea;
          border-color: #667eea;
          color: white;
          transform: translateY(-2px);
        }
        
        .btn-reserve:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #9ca3af;
        }
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .api-test-section {
          margin-top: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        
        .api-header {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          padding: 1.5rem 2rem;
          color: white;
        }
        
        .api-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .api-buttons {
          padding: 1.5rem 2rem;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        
        @media (min-width: 768px) {
          .api-buttons {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        .btn-api {
          padding: 0.875rem;
          background: #f3f4f6;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }
        
        .btn-api:hover {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-color: #f093fb;
          color: white;
          transform: translateY(-2px);
        }
        
        .footer {
          margin-top: 2rem;
          text-align: center;
          color: white;
          font-size: 0.875rem;
          opacity: 0.8;
        }
        
        .footer code {
          background: rgba(255,255,255,0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 5px;
        }
      `}</style>

      <main className="inventory-container">
        <div className="content-wrapper">
          {/* Header */}
          <div className="header">
            <h1>📦 Inventory Management System</h1>
            <p>Create, search, and manage your inventory items</p>
          </div>

          <div className="grid">
            {/* Create Item Form */}
            <div className="card">
              <div className="card-header">
                <h2>
                  <span>➕</span>
                  Create New Item
                </h2>
                <p>Add products to your inventory</p>
              </div>
              
              <div className="card-body">
                <form onSubmit={handleCreate}>
                  <div className="form-group">
                    <label className="form-label">
                      SKU * <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>(Unique identifier)</span>
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value.toUpperCase())}
                      placeholder="e.g., LAPTOP-001"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Stock Quantity *</label>
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="100"
                        required
                        min="0"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Price (USD)</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="999.99"
                        step="0.01"
                        min="0"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? '⏳ Creating...' : '✨ Create Item'}
                  </button>
                </form>
              </div>
            </div>

            {/* Search & View Items */}
            <div className="card">
              <div className="card-header green">
                <h2>
                  <span>🔍</span>
                  Search Inventory
                </h2>
                <p>Find products by SKU</p>
              </div>
              
              <div className="card-body">
                <form onSubmit={handleSearch}>
                  <div className="form-group">
                    <label className="form-label">Enter SKU</label>
                    <input
                      type="text"
                      value={searchSku}
                      onChange={(e) => setSearchSku(e.target.value.toUpperCase())}
                      placeholder="e.g., LAPTOP-001"
                      className="form-input"
                    />
                  </div>

                  <button type="submit" disabled={loading || !searchSku} className="btn btn-success">
                    {loading ? '⏳ Searching...' : '🔎 Search'}
                  </button>
                </form>

                {error && (
                  <div className="error-box" style={{ marginTop: '1.5rem' }}>
                    <p className="error-title">Error</p>
                    <p className="error-text">{error}</p>
                  </div>
                )}

                {items.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    {items.map((item) => (
                      <div key={item.sku} className="item-card">
                        <div className="item-header">
                          <div>
                            <h3 className="item-title">{item.sku}</h3>
                            <p className="item-date">
                              {item.updatedAt && (
                                <>Updated {new Date(item.updatedAt).toLocaleString()}</>
                              )}
                            </p>
                          </div>
                          <span className={`stock-badge ${
                            item.stock > 50 ? 'stock-high' : item.stock > 10 ? 'stock-medium' : 'stock-low'
                          }`}>
                            {item.stock} units
                          </span>
                        </div>

                        {item.price && (
                          <div className="price-box">
                            <p className="price-label">Price</p>
                            <p className="price-value">${item.price.toFixed(2)}</p>
                          </div>
                        )}

                        <div className="btn-group">
                          <button
                            onClick={() => handleReserve(item.sku, 1)}
                            disabled={loading || item.stock === 0}
                            className="btn-reserve"
                          >
                            Reserve 1
                          </button>
                          <button
                            onClick={() => handleReserve(item.sku, 5)}
                            disabled={loading || item.stock < 5}
                            className="btn-reserve"
                          >
                            Reserve 5
                          </button>
                          <button
                            onClick={() => handleReserve(item.sku, 10)}
                            disabled={loading || item.stock < 10}
                            className="btn-reserve"
                          >
                            Reserve 10
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {items.length === 0 && !error && !loading && (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>No items found. Search for a SKU above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* API Tests Section */}
          <div className="api-test-section">
            <div className="api-header">
              <h2>
                <span>🧪</span>
                Quick API Tests
              </h2>
            </div>
            <div className="api-buttons">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`${API_URL}/inventory/health`);
                    const data = await response.json();
                    alert('✅ Health Check:\n\n' + JSON.stringify(data, null, 2));
                  } catch (err) {
                    alert('❌ Error: ' + err);
                  }
                }}
                className="btn-api"
              >
                🏥 Health Check
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`${API_URL}/inventory/ping`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ test: 'ping' }),
                    });
                    const data = await response.json();
                    alert('✅ Ping Response:\n\n' + JSON.stringify(data, null, 2));
                  } catch (err) {
                    alert('❌ Error: ' + err);
                  }
                }}
                className="btn-api"
              >
                📡 Test Ping
              </button>
              <button
                onClick={() => window.open(`${API_URL}/inventory/health`, '_blank')}
                className="btn-api"
              >
                🌐 Open API
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(API_URL);
                  alert('✅ API URL copied to clipboard!');
                }}
                className="btn-api"
              >
                📋 Copy API URL
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <p>API Endpoint: <code>{API_URL}</code></p>
          </div>
        </div>
      </main>
    </>
  );
}
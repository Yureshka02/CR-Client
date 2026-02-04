'use client';

import { useState, useEffect } from 'react';

// Replace with your actual API Gateway URL
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
  
  // Form state
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  
  // Search state
  const [searchSku, setSearchSku] = useState('');

  // Create new item
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/inventory/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sku: sku,
          stock: parseInt(stock),
          price: price ? parseFloat(price) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✓ Item ${data.sku} created`);
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

  // Fetch single item
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

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItem(searchSku);
  };

  // Reserve stock
  const handleReserve = async (itemSku: string, qty: number) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/inventory/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sku: itemSku,
          qty: qty,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✓ Reserved ${qty} units`);
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
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">
            Inventory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage stock and items
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Create Item Form */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Create Item
            </h2>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-600 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="LAPTOP-001"
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-600 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="100"
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-600 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="999.99"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-2.5 text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>

          {/* Search & View Items */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Search Item
            </h2>
            
            <form onSubmit={handleSearch} className="space-y-5 mb-8">
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-600 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={searchSku}
                  onChange={(e) => setSearchSku(e.target.value.toUpperCase())}
                  placeholder="LAPTOP-001"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !searchSku}
                className="w-full bg-gray-900 text-white py-2.5 text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="border-l-2 border-red-500 bg-red-50 px-4 py-3 mb-6">
                <p className="text-xs text-red-800">{error}</p>
              </div>
            )}

            {/* Display Items */}
            {items.length > 0 && (
              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.sku}
                    className="border border-gray-200 p-5"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">
                          {item.sku}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.updatedAt && (
                            <>
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </>
                          )}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {item.stock} units
                      </span>
                    </div>

                    {item.price && (
                      <div className="mb-4">
                        <p className="text-2xl font-light text-gray-900">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReserve(item.sku, 1)}
                        disabled={loading || item.stock === 0}
                        className="flex-1 border border-gray-300 text-gray-900 py-2 text-xs font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                      >
                        Reserve 1
                      </button>
                      <button
                        onClick={() => handleReserve(item.sku, 5)}
                        disabled={loading || item.stock < 5}
                        className="flex-1 border border-gray-300 text-gray-900 py-2 text-xs font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                      >
                        Reserve 5
                      </button>
                      <button
                        onClick={() => handleReserve(item.sku, 10)}
                        disabled={loading || item.stock < 10}
                        className="flex-1 border border-gray-300 text-gray-900 py-2 text-xs font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                      >
                        Reserve 10
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length === 0 && !error && !loading && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">No items found</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats & Test Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            API Tests
          </h2>
          <div className="grid md:grid-cols-4 gap-3">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${API_URL}/inventory/health`);
                  const data = await response.json();
                  alert('✓ Health Check:\n\n' + JSON.stringify(data, null, 2));
                } catch (err) {
                  alert('✗ Error: ' + err);
                }
              }}
              className="border border-gray-300 text-gray-900 py-2 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              Health
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
                  alert('✓ Ping:\n\n' + JSON.stringify(data, null, 2));
                } catch (err) {
                  alert('✗ Error: ' + err);
                }
              }}
              className="border border-gray-300 text-gray-900 py-2 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              Ping
            </button>
            <button
              onClick={() => {
                window.open(`${API_URL}/inventory/health`, '_blank');
              }}
              className="border border-gray-300 text-gray-900 py-2 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              Open API
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(API_URL);
                alert('✓ Copied');
              }}
              className="border border-gray-300 text-gray-900 py-2 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              Copy URL
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>{API_URL}</p>
        </div>
      </div>
    </main>
  );
}
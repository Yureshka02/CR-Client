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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Inventory Management
              </h1>
              <p className="text-slate-600 mt-1">
                Manage your products and stock levels
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Item Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Item
              </h2>
              <p className="text-blue-100 text-sm mt-1">Add products to your inventory</p>
            </div>
            
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="e.g., LAPTOP-001"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="100"
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="999.99"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Item
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Search & View Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Inventory
              </h2>
              <p className="text-emerald-100 text-sm mt-1">Find products by SKU</p>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleSearch} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Enter SKU
                  </label>
                  <input
                    type="text"
                    value={searchSku}
                    onChange={(e) => setSearchSku(e.target.value.toUpperCase())}
                    placeholder="e.g., LAPTOP-001"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !searchSku}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? 'Searching...' : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search
                    </>
                  )}
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-red-900 text-sm">Error</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Items */}
              {items.length > 0 && (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.sku}
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200 hover:border-blue-300 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {item.sku}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {item.updatedAt && (
                              <>Updated {new Date(item.updatedAt).toLocaleString()}</>
                            )}
                          </p>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-bold ${
                            item.stock > 50
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.stock > 10
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.stock} units
                        </span>
                      </div>

                      {item.price && (
                        <div className="mb-4 bg-white rounded-lg p-4 border border-slate-200">
                          <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide mb-1">Price</p>
                          <p className="text-3xl font-bold text-slate-900">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleReserve(item.sku, 1)}
                          disabled={loading || item.stock === 0}
                          className="bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-400 text-slate-700 font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Reserve 1
                        </button>
                        <button
                          onClick={() => handleReserve(item.sku, 5)}
                          disabled={loading || item.stock < 5}
                          className="bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-400 text-slate-700 font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Reserve 5
                        </button>
                        <button
                          onClick={() => handleReserve(item.sku, 10)}
                          disabled={loading || item.stock < 10}
                          className="bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-400 text-slate-700 font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Reserve 10
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {items.length === 0 && !error && !loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-slate-600 font-medium">No items found</p>
                  <p className="text-slate-500 text-sm mt-1">Search for a SKU to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Tests Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              API Testing
            </h2>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
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
              className="bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-purple-400 text-slate-700 font-semibold py-3 rounded-xl transition-all text-sm"
            >
              🏥 Health
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
                  alert('✅ Ping:\n\n' + JSON.stringify(data, null, 2));
                } catch (err) {
                  alert('❌ Error: ' + err);
                }
              }}
              className="bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-purple-400 text-slate-700 font-semibold py-3 rounded-xl transition-all text-sm"
            >
              📡 Ping
            </button>
            <button
              onClick={() => window.open(`${API_URL}/inventory/health`, '_blank')}
              className="bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-purple-400 text-slate-700 font-semibold py-3 rounded-xl transition-all text-sm"
            >
              🌐 Open
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(API_URL);
                alert('✅ Copied!');
              }}
              className="bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-purple-400 text-slate-700 font-semibold py-3 rounded-xl transition-all text-sm"
            >
              📋 Copy
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
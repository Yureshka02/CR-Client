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
        // Refresh the item if we're viewing it
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
        // Refresh the item
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📦 Inventory Management System
          </h1>
          <p className="text-gray-600">
            Create, search, and manage your inventory items
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Item Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
              <span className="text-3xl mr-2">➕</span>
              Create New Item
            </h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU * <span className="text-xs text-gray-500">(Unique identifier)</span>
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="e.g., LAPTOP-001"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="e.g., 100"
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD) <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 999.99"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-md hover:shadow-lg"
              >
                {loading ? '⏳ Creating...' : '✨ Create Item'}
              </button>
            </form>
          </div>

          {/* Search & View Items */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
              <span className="text-3xl mr-2">🔍</span>
              Search Item
            </h2>
            
            <form onSubmit={handleSearch} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter SKU to Search
                </label>
                <input
                  type="text"
                  value={searchSku}
                  onChange={(e) => setSearchSku(e.target.value.toUpperCase())}
                  placeholder="e.g., LAPTOP-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !searchSku}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors shadow-md hover:shadow-lg"
              >
                {loading ? '⏳ Searching...' : '🔎 Search'}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Display Items */}
            {items.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Search Results
                </h3>
                {items.map((item) => (
                  <div
                    key={item.sku}
                    className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {item.sku}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.updatedAt && (
                            <>
                              Last updated: {new Date(item.updatedAt).toLocaleDateString()} at{' '}
                              {new Date(item.updatedAt).toLocaleTimeString()}
                            </>
                          )}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                          item.stock > 50
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : item.stock > 10
                            ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                            : 'bg-red-100 text-red-800 border-2 border-red-300'
                        }`}
                      >
                        {item.stock} in stock
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-100 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Stock Level</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                          {item.stock} units
                        </p>
                      </div>
                      {item.price && (
                        <div>
                          <p className="text-xs text-gray-600 uppercase font-semibold">Unit Price</p>
                          <p className="text-2xl font-bold text-gray-800 mt-1">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReserve(item.sku, 1)}
                        disabled={loading || item.stock === 0}
                        className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 transition-colors shadow-md"
                      >
                        Reserve 1
                      </button>
                      <button
                        onClick={() => handleReserve(item.sku, 5)}
                        disabled={loading || item.stock < 5}
                        className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 transition-colors shadow-md"
                      >
                        Reserve 5
                      </button>
                      <button
                        onClick={() => handleReserve(item.sku, 10)}
                        disabled={loading || item.stock < 10}
                        className="flex-1 bg-orange-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-800 disabled:bg-gray-400 transition-colors shadow-md"
                      >
                        Reserve 10
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length === 0 && !error && !loading && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p>No items found. Search for an SKU above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats & Test Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="text-3xl mr-2">🧪</span>
            Quick API Tests
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
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
              className="bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
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
              className="bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
            >
              📡 Test Ping
            </button>
            <button
              onClick={() => {
                window.open(`${API_URL}/inventory/health`, '_blank');
              }}
              className="bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
            >
              🌐 Open API
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(API_URL);
                alert('✅ API URL copied to clipboard!');
              }}
              className="bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
            >
              📋 Copy API URL
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>API Endpoint: <code className="bg-gray-200 px-2 py-1 rounded">{API_URL}</code></p>
        </div>
      </div>
    </main>
  );
}
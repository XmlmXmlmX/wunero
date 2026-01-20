'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import type { Wishlist, WishItem } from '@/types';

export default function WishlistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPriority, setNewPriority] = useState(0);

  useEffect(() => {
    loadWishlist();
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlists/${id}`);
      const data = await response.json();
      setWishlist(data);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const loadItems = async () => {
    try {
      const response = await fetch(`/api/wishlists/${id}/items`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await fetch(`/api/wishlists/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          url: newUrl,
          priority: newPriority,
        }),
      });

      if (response.ok) {
        setNewTitle('');
        setNewDescription('');
        setNewUrl('');
        setNewPriority(0);
        setShowNewForm(false);
        loadItems();
      }
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const togglePurchased = async (item: WishItem) => {
    try {
      await fetch(`/api/wishlists/${id}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchased: !item.purchased }),
      });
      loadItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/wishlists/${id}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadItems();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Wishlist not found</h1>
          <Link href="/wishlists" className="text-indigo-600 hover:text-indigo-800">
            Back to Wishlists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/wishlists" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
          ← Back to Wishlists
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{wishlist.title}</h1>
              {wishlist.description && (
                <p className="text-gray-600 mb-4">{wishlist.description}</p>
              )}
            </div>
            <button
              onClick={copyShareLink}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              🔗 Share
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Items</h2>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            {showNewForm ? 'Cancel' : '+ Add Item'}
          </button>
        </div>

        {showNewForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">Add New Item</h3>
            <form onSubmit={createItem}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="item-title">
                  Title *
                </label>
                <input
                  id="item-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="item-description">
                  Description
                </label>
                <textarea
                  id="item-description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="item-url">
                  Product URL (Amazon, eBay, Idealo)
                </label>
                <input
                  id="item-url"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://www.amazon.com/..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="item-priority">
                  Priority (0-10)
                </label>
                <input
                  id="item-priority"
                  type="number"
                  min="0"
                  max="10"
                  value={newPriority}
                  onChange={(e) => setNewPriority(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Add Item
              </button>
            </form>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No items yet</h3>
            <p className="text-gray-500 mb-6">Add your first wish item to this list!</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                  item.purchased ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-xl font-semibold ${item.purchased ? 'line-through' : ''}`}>
                        {item.title}
                      </h3>
                      {item.priority > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Priority: {item.priority}
                        </span>
                      )}
                      {item.purchased === 1 && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          ✓ Purchased
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-gray-600 mb-3">{item.description}</p>
                    )}
                    {item.price && (
                      <p className="text-lg font-semibold text-indigo-600 mb-2">{item.price}</p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm inline-block mb-2"
                      >
                        🔗 View Product
                      </a>
                    )}
                    {item.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="mt-3 max-w-xs rounded-lg"
                      />
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => togglePurchased(item)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        item.purchased
                          ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {item.purchased ? 'Unmark' : 'Mark as Purchased'}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

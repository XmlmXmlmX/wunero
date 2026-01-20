'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Wishlist } from '@/types';

export default function WishlistsPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      const response = await fetch('/api/wishlists');
      const data = await response.json();
      setWishlists(data);
    } catch (error) {
      console.error('Error loading wishlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await fetch('/api/wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });

      if (response.ok) {
        setNewTitle('');
        setNewDescription('');
        setShowNewForm(false);
        loadWishlists();
      }
    } catch (error) {
      console.error('Error creating wishlist:', error);
    }
  };

  const deleteWishlist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wishlist?')) return;

    try {
      const response = await fetch(`/api/wishlists/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadWishlists();
      }
    } catch (error) {
      console.error('Error deleting wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-indigo-600 hover:text-indigo-800 mb-2 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">My Wishlists</h1>
          </div>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            {showNewForm ? 'Cancel' : '+ New Wishlist'}
          </button>
        </div>

        {showNewForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Wishlist</h2>
            <form onSubmit={createWishlist}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="title">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Create Wishlist
              </button>
            </form>
          </div>
        )}

        {wishlists.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No wishlists yet</h2>
            <p className="text-gray-500 mb-6">Create your first wishlist to get started!</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Create Your First Wishlist
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((wishlist) => (
              <div key={wishlist.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{wishlist.title}</h3>
                {wishlist.description && (
                  <p className="text-gray-600 mb-4">{wishlist.description}</p>
                )}
                <div className="text-sm text-gray-400 mb-4">
                  Created {new Date(wishlist.created_at).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/wishlists/${wishlist.id}`}
                    className="flex-1 text-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Items
                  </Link>
                  <button
                    onClick={() => deleteWishlist(wishlist.id)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { clubsAPI } from '@/lib/api';

export default function ClubsPage() {
  const [clubName, setClubName] = useState('');
  const [clubs, setClubs] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const response = await clubsAPI.getAll();
      setClubs(response.data);
    } catch (error: any) {
      console.error('Error loading clubs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await clubsAPI.create({ name: clubName });
      setMessage(`Success! Club created: ${response.data.club_id}`);
      setClubName('');
      loadClubs();
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">Tournament Manager</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Club Management</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Club</h2>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              required
              placeholder="Club Name"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Club'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">All Clubs</h2>
          {clubs.length === 0 ? (
            <p className="text-gray-500">No clubs registered yet. Create one above!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.map((club) => (
                <div key={club.id} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-lg">{club.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">ID: {club.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

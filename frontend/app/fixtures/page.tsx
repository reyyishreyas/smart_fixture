'use client';

import { useState } from 'react';
import Link from 'next/link';
import { fixturesAPI } from '@/lib/api';

export default function FixturesPage() {
  const [eventId, setEventId] = useState('');
  const [fixtures, setFixtures] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setFixtures(null);
    
    try {
      const response = await fixturesAPI.generate(eventId);
      setMessage(`Success! Generated ${response.data.total_matches} matches for ${response.data.total_players} players`);
      loadFixtures();
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadFixtures = async () => {
    if (!eventId) return;
    
    try {
      const response = await fixturesAPI.get(eventId);
      setFixtures(response.data);
    } catch (error: any) {
      console.error('Error loading fixtures:', error);
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Knockout Fixtures</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Generate Tournament Bracket</h2>
          <form onSubmit={handleGenerate} className="flex gap-4">
            <input
              type="text"
              required
              placeholder="Event ID (UUID)"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? 'Generating...' : 'Generate Fixtures'}
            </button>
            <button
              type="button"
              onClick={loadFixtures}
              className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700"
            >
              Load Fixtures
            </button>
          </form>
        </div>

        {fixtures && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tournament Bracket</h2>
            {Object.keys(fixtures.fixtures).map((round) => (
              <div key={round} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Round {round}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fixtures.fixtures[round].map((match: any) => (
                    <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Player 1: {match.player1_id}</p>
                          <p className="font-medium">Player 2: {match.player2_id || 'BYE'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded ${match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : match.status === 'bye' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {match.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

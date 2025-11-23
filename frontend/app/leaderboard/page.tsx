'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resultsAPI } from '@/lib/api';

export default function LeaderboardPage() {
  const [eventId, setEventId] = useState('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLeaderboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await resultsAPI.getLeaderboard(eventId);
      setLeaderboard(response.data.leaderboard);
    } catch (error: any) {
      console.error('Error loading leaderboard:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tournament Leaderboard</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={loadLeaderboard} className="flex gap-4">
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
              {loading ? 'Loading...' : 'Load Leaderboard'}
            </button>
          </form>
        </div>

        {leaderboard.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wins</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Losses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sets Won</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sets Lost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((entry, index) => (
                  <tr key={entry.player_id} className={index < 3 ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{index + 1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entry.player_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.wins}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.losses}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.sets_won}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.sets_lost}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-indigo-600">{entry.points}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

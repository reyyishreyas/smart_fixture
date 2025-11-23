'use client';

import { useState } from 'react';
import Link from 'next/link';
import { matchCodesAPI, resultsAPI } from '@/lib/api';

export default function MatchPage() {
  const [matchId, setMatchId] = useState('');
  const [code, setCode] = useState('');
  const [umpireName, setUmpireName] = useState('');
  const [verified, setVerified] = useState(false);
  const [score, setScore] = useState({ player1_score: '', player2_score: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await matchCodesAPI.generate(matchId, umpireName);
      setMessage(`Code generated: ${response.data.code}`);
      setCode(response.data.code);
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await matchCodesAPI.verify(matchId, code);
      setMessage('Code verified! You can now enter scores.');
      setVerified(true);
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.detail || error.message}`);
      setVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await resultsAPI.updateScore({
        match_id: matchId,
        player1_score: parseInt(score.player1_score),
        player2_score: parseInt(score.player2_score)
      });
      setMessage(`Score submitted! Winner: ${response.data.winner_id}`);
      setVerified(false);
      setCode('');
      setScore({ player1_score: '', player2_score: '' });
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Match Scoring</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Generate Umpire Code</h2>
            <form onSubmit={handleGenerateCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Match ID</label>
                <input
                  type="text"
                  required
                  placeholder="UUID"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Umpire Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={umpireName}
                  onChange={(e) => setUmpireName(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? 'Generating...' : 'Generate Code'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Verify Code</h2>
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Match ID</label>
                <input
                  type="text"
                  required
                  placeholder="UUID"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Access Code</label>
                <input
                  type="text"
                  required
                  placeholder="6-character code"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          </div>
        </div>

        {verified && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Submit Match Score</h2>
            <form onSubmit={handleSubmitScore} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Player 1 Score</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={score.player1_score}
                    onChange={(e) => setScore({...score, player1_score: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Player 2 Score</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={score.player2_score}
                    onChange={(e) => setScore({...score, player2_score: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? 'Submitting...' : 'Submit Score'}
              </button>
            </form>
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

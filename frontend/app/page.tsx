'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';

function EventForm({ onEventCreated }: { onEventCreated?: () => void }) {
  const [newEvent, setNewEvent] = useState({ name: '', type: 'knockout', min_rest: 10 });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // Fix: use /events, not /api/events
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/events`, newEvent);
      setMessage('Event created successfully!');
      setNewEvent({ name: '', type: 'knockout', min_rest: 10 });

      if (onEventCreated) onEventCreated(); // refresh events after creation
    } catch (err: any) {
      setMessage(`Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Create New Event</h3>
      {message && (
        <div className={`mb-4 ${message.includes('Error') ? 'text-red-700' : 'text-green-700'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Name</label>
          <input
            type="text"
            required
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Type</label>
          <select
            value={newEvent.type}
            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="knockout">Knockout</option>
            <option value="round-robin">Round Robin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Minimum Rest (minutes)</label>
          <input
            type="number"
            required
            value={newEvent.min_rest}
            onChange={(e) => setNewEvent({ ...newEvent, min_rest: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/events`);
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Tournament Manager</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Knockout Tournament Management System
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Professional tournament management with smart scheduling and real-time updates
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Player Registration */}
          <Link href="/players" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-md mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Player Registration</h3>
            <p className="mt-2 text-gray-600">Register players and upload CSV files</p>
          </Link>

          {/* Manage Clubs */}
          <Link href="/clubs" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-md mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Clubs</h3>
            <p className="mt-2 text-gray-600">Add and manage tournament clubs</p>
          </Link>

          {/* Generate Fixtures */}
          <Link href="/fixtures" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-md mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Generate Fixtures</h3>
            <p className="mt-2 text-gray-600">Create knockout tournament brackets</p>
          </Link>

          {/* Smart Scheduling */}
          <Link href="/schedule" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-md mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Smart Scheduling</h3>
            <p className="mt-2 text-gray-600">Multi-court scheduling with rest times</p>
          </Link>

          {/* Match Scoring */}
          <Link href="/match" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-md mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Match Scoring</h3>
            <p className="mt-2 text-gray-600">Enter match results with umpire codes</p>
          </Link>

          {/* Leaderboard */}
          <Link href="/leaderboard" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-md mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
            <p className="mt-2 text-gray-600">View live tournament standings</p>
          </Link>
        </div>

        {/* Event Form */}
        <EventForm onEventCreated={fetchEvents} />

        {/* Active Events */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Active Events</h3>
          {events.length === 0 ? (
            <p className="text-gray-500">No events created yet.</p>
          ) : (
            <ul className="space-y-2 text-gray-800">
              {events.map((ev) => (
                <li key={ev.id} className="p-2 border rounded-md">
                  <span className="font-semibold">{ev.name}</span> — ID:{' '}
                  <span className="text-indigo-600">{ev.id}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: 'knockout',
    min_rest: 10
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch existing events
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/events`);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle creating a new event
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, newEvent);
      setMessage('Event created successfully!');
      setNewEvent({ name: '', type: 'knockout', min_rest: 10 });
      fetchEvents(); // refresh events list
    } catch (err: any) {
      setMessage(`Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-green-600">
                Tournament Manager
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Event Management</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}
          >
            {message}
          </div>
        )}

        {/* Create Event Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Name</label>
              <input
                type="text"
                required
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Event Type</label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </div>

        {/* Display Events with ID */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Available Events</h2>
          {events.length === 0 ? (
            <p className="text-gray-500">No events found.</p>
          ) : (
            <ul className="space-y-2 text-gray-700">
              {events.map((ev) => (
                <li key={ev.id} className="p-2 border rounded-md">
                  {ev.name} ID: {ev.id}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-green-600 hover:text-green-800">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

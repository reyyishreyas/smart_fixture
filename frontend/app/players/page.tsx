'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { playersAPI } from '@/lib/api';
import axios from 'axios';

interface PlayerForm {
  name: string;
  age: string;       // keep as string for input
  phone: string;
  club_id: string;
  event_ids: string[];
}

export default function PlayersPage() {
  const [formData, setFormData] = useState<PlayerForm>({
    name: '',
    age: '',
    phone: '',
    club_id: '',
    event_ids: []
  });
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch clubs and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clubsRes = await axios.get(`${API_URL}/clubs`);
        setClubs(clubsRes.data);

        const eventsRes = await axios.get(`${API_URL}/events`);
        setEvents(eventsRes.data);
      } catch (err) {
        console.error('Error fetching clubs/events:', err);
        setMessage('Failed to fetch clubs or events. Check backend.');
      }
    };
    fetchData();
  }, [API_URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await playersAPI.create({
        ...formData,
        age: parseInt(formData.age),
        event_ids: formData.event_ids
      });
      setMessage(`Success! Player registered: ${response.data.player_id}`);
      setFormData({ name: '', age: '', phone: '', club_id: '', event_ids: [] });
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Updated CSV Upload: registers player to event by event_name (case-insensitive)
  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setMessage('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const response = await axios.post(`${API_URL}/players/upload-csv`, formDataObj, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

      setMessage(`CSV uploaded! ${response.data.inserted_count} players added, ${response.data.invalid_rows} errors`);
      setFile(null);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Player Registration</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Individual Registration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Individual Registration</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Select Club</label>
                <select
                  required
                  value={formData.club_id}
                  onChange={(e) => setFormData({ ...formData, club_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Club</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Select Events</label>
                <select
                  multiple
                  value={formData.event_ids}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, event_ids: selected });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.name} ({ev.type})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? 'Registering...' : 'Register Player'}
              </button>
            </form>
          </div>

          {/* CSV Upload */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">CSV Bulk Upload</h2>
            <form onSubmit={handleCSVUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                <div className="text-xs text-gray-500 mb-2">
                  CSV Format: name, age, phone, club_id, event_name
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">CSV Example:</h3>
              <pre className="text-xs text-blue-700">
{`name,age,phone,club_id,event_name
John Doe,25,+1234567890,uuid-here,Knockout
Jane Smith,28,+0987654321,uuid-here,Round Robin`}
              </pre>
            </div>
          </div>
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

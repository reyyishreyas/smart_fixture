'use client';

import { useState } from 'react';
import Link from 'next/link';
import { schedulingAPI } from '@/lib/api';
import { format, parseISO } from 'date-fns';

export default function SchedulePage() {
  const [eventId, setEventId] = useState('');
  const [numCourts, setNumCourts] = useState('4');
  const [matchDuration, setMatchDuration] = useState('30');
  const [startTime, setStartTime] = useState('');
  const [schedule, setSchedule] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await schedulingAPI.schedule({
        event_id: eventId,
        num_courts: parseInt(numCourts),
        match_duration_minutes: parseInt(matchDuration),
        start_time: new Date(startTime).toISOString()
      });
      setMessage(`Success! Scheduled ${response.data.total_matches} matches`);
      setSchedule(response.data.scheduled || []);
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCourtSchedules = () => {
    const courts: any = {};
    schedule.forEach((match) => {
      if (match.court_id) {
        if (!courts[match.court_id]) {
          courts[match.court_id] = [];
        }
        courts[match.court_id].push(match);
      }
    });
    return courts;
  };

  const courtSchedules = getCourtSchedules();

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Smart Court Scheduling</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create Schedule</h2>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Event ID</label>
                <input
                  type="text"
                  required
                  placeholder="UUID"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Courts</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={numCourts}
                  onChange={(e) => setNumCourts(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Match Duration (minutes)</label>
                <input
                  type="number"
                  required
                  min="15"
                  max="120"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={matchDuration}
                  onChange={(e) => setMatchDuration(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating Schedule...' : 'Create Smart Schedule'}
            </button>
          </form>
        </div>

        {Object.keys(courtSchedules).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(courtSchedules).map((courtId) => (
              <div key={courtId} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">{courtId}</h3>
                <div className="space-y-3">
                  {courtSchedules[courtId].map((match: any, idx: number) => (
                    <div key={match.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                      <div className="text-sm font-medium">Match #{idx + 1}</div>
                      {match.start_time && (
                        <div className="text-xs text-gray-500">
                          {format(parseISO(match.start_time), 'HH:mm')} - {match.end_time && format(parseISO(match.end_time), 'HH:mm')}
                        </div>
                      )}
                      <div className="text-xs text-gray-600 mt-1">Round {match.round}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Scheduling Features</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>10-minute minimum rest time between matches for each player</li>
            <li>Zero overlapping matches for any player</li>
            <li>Optimal court utilization to minimize idle time</li>
            <li>Automatic conflict detection and resolution</li>
          </ul>
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

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const playersAPI = {
  create: (data: any) => api.post('/players', data),
  getAll: (eventId?: string) => api.get('/players', { params: { event_id: eventId } }),
  uploadCSV: (file: File, eventId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (eventId) formData.append('event_id', eventId);
    return api.post('/players/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const clubsAPI = {
  create: (data: { name: string }) => api.post('/clubs', data),
  getAll: () => api.get('/clubs'),
};

export const fixturesAPI = {
  generate: (eventId: string) => api.post('/generate-fixtures', { event_id: eventId }),
  get: (eventId: string) => api.get(`/fixtures/${eventId}`),
};

export const schedulingAPI = {
  schedule: (data: any) => api.post('/schedule-matches', data),
  getCourt: (courtId: string, eventId?: string) => 
    api.get(`/schedule/${courtId}`, { params: { event_id: eventId } }),
};

export const matchCodesAPI = {
  generate: (matchId: string, umpire: string) => 
    api.post('/match-code/generate', { match_id: matchId, assigned_umpire: umpire }),
  verify: (matchId: string, code: string) => 
    api.post('/match-code/verify', { match_id: matchId, code }),
};

export const resultsAPI = {
  updateScore: (data: any) => api.post('/update-score', data),
  getLeaderboard: (eventId: string) => api.get(`/leaderboard/${eventId}`),
};

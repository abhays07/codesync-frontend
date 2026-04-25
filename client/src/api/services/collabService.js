import api from '../axios';

// Create a session for a specific file
export const createCollabSession = (projectId, fileId, ownerId) => 
    api.post('/sessions/create', { projectId, fileId, ownerId });

// Join an existing session
export const joinCollabSession = (sessionId, userId, role) => 
    api.post(`/sessions/${sessionId}/join?userId=${userId}&role=${role}`);

// Get active participants 
export const getSessionParticipants = (sessionId) => 
    api.get(`/sessions/${sessionId}/participants`);

// Update cursor coordinates
export const updateCursorPosition = (sessionId, userId, line, col) => 
    api.put(`/sessions/${sessionId}/cursor`, { userId, line, col });

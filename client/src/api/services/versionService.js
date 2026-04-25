import api from '../axios';

const BASE_URL = '/versions';

// Create a new snapshot
export const createSnapshot = (data) => api.post(`${BASE_URL}/snapshot`, data);

// Get file version history
export const getFileHistory = (fileId) => api.get(`${BASE_URL}/history/${fileId}`);

// Get line-by-line diff between two snapshots
export const getDiff = (baseId, headId) => api.get(`${BASE_URL}/diff?base=${baseId}&head=${headId}`);

// Restore a snapshot
export const restoreSnapshot = (snapshotId, userId) => api.post(`${BASE_URL}/restore/${snapshotId}?userId=${userId}`);

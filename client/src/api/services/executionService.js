import api from '../axios';

// Submit a new code execution job
export const submitJob = (data) => api.post('/executions/submit', data);

// Check the status and results of a job
export const getJobStatus = (jobId) => api.get(`/executions/${jobId}`);

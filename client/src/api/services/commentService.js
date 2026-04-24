import api from '../axios';

const BASE_URL = '/comments';

export const addComment = (data) => api.post(`${BASE_URL}/add`, data);
export const getCommentsByFile = (fileId) => api.get(`${BASE_URL}/file/${fileId}`);
export const deleteComment = (id) => api.delete(`${BASE_URL}/${id}`);

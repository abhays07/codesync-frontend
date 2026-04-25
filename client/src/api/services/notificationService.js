import api from '../axios';

const BASE_URL = '/notifications';

export const getNotifications = (userId) => api.get(`${BASE_URL}/user/${userId}`);
export const markAsRead = (id) => api.patch(`${BASE_URL}/read/${id}`);
export const markAllAsRead = (userId) => api.patch(`${BASE_URL}/read-all/${userId}`);
export const deleteNotification = (id) => api.delete(`${BASE_URL}/${id}`);
export const clearAllNotifications = (userId) => api.delete(`${BASE_URL}/user/${userId}`);
export const sendNotification = (data, emails = []) => {
  const query = emails.length ? `?emails=${emails.join(',')}` : '';
  return api.post(`${BASE_URL}/send${query}`, data);
};

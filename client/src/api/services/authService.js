import api from '../axios';

export async function loginUser(payload) {
  const response = await api.post('/auth/login', payload);
  return response.data;
}

export async function registerUser(payload) {
  const response = await api.post('/auth/register', payload);
  return response.data;
}

export async function getMe() {
    const response = await api.get('/auth/me');
    return response.data;
}

export const updatePassword = async (userId, newPassword) => {
    const response = await api.patch(`/auth/password/${userId}`, { newPassword });
    return response.data;
};

export const deactivateAccount = async (userId) => {
    const response = await api.put(`/auth/deactivate/${userId}`);
    return response.data;
};

export const searchUsers = async (query) => {
    const response = await api.get(`/auth/search?query=${query}`);
    return response.data;
};

export const updateProfile = async (userId, profileData) => {
    const response = await api.put(`/auth/profile/${userId}`, profileData);
    return response.data;
};
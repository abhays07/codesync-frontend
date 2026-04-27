import api from '../axios';

export async function loginUser(payload) {
  const response = await api.post('/auth/login', payload);
  return response.data;
}

export async function registerUser(payload, otp) {
  const response = await api.post(`/auth/register?otp=${otp}`, payload);
  return response.data;
}

export const sendRegistrationOtp = async (email, username) => {
    const response = await api.post(`/auth/send-registration-otp`, { email, username });
    return response.data;
};

export async function getMe() {
    const response = await api.get('/auth/me');
    return response.data;
}

export const sendOtp = async (email) => {
    const response = await api.post(`/auth/send-otp`, { email });
    return response.data;
};

export const resetPassword = async (email, otp, newPassword) => {
    const response = await api.post(`/auth/reset-password`, { email, otp, newPassword });
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

export const getProfile = async (userId) => {
    const response = await api.get(`/auth/profile/${userId}`);
    return response.data;
};
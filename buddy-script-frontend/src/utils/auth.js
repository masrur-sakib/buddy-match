export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getAuthToken = () => localStorage.getItem('token');

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => Boolean(getAuthToken());

export const authFetch = (path, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
};

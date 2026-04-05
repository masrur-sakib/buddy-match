export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getAuthToken = () => localStorage.getItem('token');

const decodeBase64Url = (value) => {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map((ch) => `%${('00' + ch.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(''),
    );
  } catch {
    return null;
  }
};

const parseSignedUrlTokenPayload = (url) => {
  try {
    const parsed = new URL(url);
    const token = parsed.searchParams.get('token');
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    return JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return null;
  }
};

const isSignedImageUrlExpired = (url) => {
  if (!url || typeof url !== 'string') return false;
  const payload = parseSignedUrlTokenPayload(url);
  if (!payload || typeof payload.exp !== 'number') return false;
  return Date.now() >= payload.exp * 1000;
};

export const getStoredUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user')) || null;
    if (!user) return null;

    if (isSignedImageUrlExpired(user.profileImage)) {
      const normalizedUser = { ...user, profileImage: null };
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      return normalizedUser;
    }

    return user;
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const parseJwt = (token) => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    return JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') {
    return false;
  }
  return Date.now() >= payload.exp * 1000;
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    logout();
    return false;
  }
  return true;
};

export const authFetch = async (path, options = {}) => {
  if (!isAuthenticated()) {
    return Promise.reject(new Error('Session expired. Please log in again.'));
  }

  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    logout();
    window.location.replace('/login');
  }

  return response;
};

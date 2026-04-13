const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const registerUser = async (username, email, password) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

export const loginUser = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const verifyToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const res = await fetch(`${API_URL}/auth/verify`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) {
      logoutUser();
      return null;
    }
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  } catch (err) {
    console.error("Token verification failed", err);
    return null;
  }
};

export const getUserProfile = async () => {
  const res = await fetch(`${API_URL}/user/profile`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const savePrediction = async (predictionData) => {
  if (!localStorage.getItem('token')) return null; // Only save if logged in
  const res = await fetch(`${API_URL}/history`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(predictionData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const getHistory = async () => {
  const res = await fetch(`${API_URL}/history`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getAdminStats = async () => {
  const res = await fetch(`${API_URL}/admin/stats`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const getAdminPredictions = async () => {
  const res = await fetch(`${API_URL}/admin/predictions`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const deleteHistoryItem = async (id) => {
  const res = await fetch(`${API_URL}/history/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const deleteAdminPrediction = async (id) => {
  const res = await fetch(`${API_URL}/admin/predictions/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

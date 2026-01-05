import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchDashboardData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/dashboard`, {
      headers: getAuthHeader(),
    });
    return response;
  } catch (error) {
    console.error('Error fetching dashboard data:', error.response || error);
    throw error;
  }
}


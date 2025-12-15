import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1/pos";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const addUser = async (user) => {
  return await axios.post(`${BASE_URL}/admin/register`, user, {
    headers: getAuthHeaders(),
  });
};

export const deleteUser = async (id) => {
  return await axios.delete(`${BASE_URL}/admin/users/${id}`, {
    headers: getAuthHeaders(),
  });
};

export const fetchUsers = async () => {
  return await axios.get(`${BASE_URL}/admin/users`, {
    headers: getAuthHeaders(),
  });
};




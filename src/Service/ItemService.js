import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1/pos";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Ensure Authorization header is added to all requests from the current token.
// This helps avoid missing headers in multipart/form-data or other requests.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization && !config.headers.authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Add item
export const addItem = async (formData) => {
  const token = localStorage.getItem("token");
  console.log("Token being sent:", token);
  console.log("Role:", localStorage.getItem("role"));

  // Let the browser/axios set the Content-Type (including boundary) for multipart form data.
  return await axios.post(`${BASE_URL}/admin/items`, formData, {
    headers: {
      ...getAuthHeaders(),
    },
  });
};

// Update item
export const updateItem = async (itemId, formData) => {
  // Do not set Content-Type manually; axios will include the correct multipart boundary.
  const headers = { ...getAuthHeaders() };
  console.debug("updateItem headers", headers);
  return await axios.put(`${BASE_URL}/admin/items/${itemId}`, formData, { headers });
};
// Purchase (decrement stock) - public endpoint
export const purchaseItem = async (itemId, quantity = 1) => {
  return await axios.post(`${BASE_URL}/items/${itemId}/purchase`, { quantity }, {
    headers: getAuthHeaders()
  });
};
// Delete item
export const deleteItem = async (itemId) => {
  return await axios.delete(`${BASE_URL}/admin/items/${itemId}`, {
    headers: getAuthHeaders(),
  });
};

// Fetch items (public)
export const fetchItems = async () => {
  return await axios.get(`${BASE_URL}/items`);
};

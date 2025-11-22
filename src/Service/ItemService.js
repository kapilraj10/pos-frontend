import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1/pos";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Add item
// export const addItem = async (formData) => {
//   return await axios.post(`${BASE_URL}/admin/items`, formData, {
//     headers: getAuthHeaders(),
//   });
// };

export const addItem = async (formData) => {
  const token = localStorage.getItem("token");
  console.log("Token being sent:", token);
  console.log("Role:", localStorage.getItem("role"));
  
  return await axios.post("http://localhost:8080/api/v1/pos/admin/items", formData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    },
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

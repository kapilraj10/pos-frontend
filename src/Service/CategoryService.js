import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1/pos";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const addCategory = async (formData) => {
  try {
    // NEVER set Content-Type for FormData - axios adds boundary automatically
    const res = await axios.post(`${BASE_URL}/admin/categories`, formData, {
      headers: getAuthHeaders(),
    });
    return res;
  } catch (err) {
    console.error("CategoryService error:", err.response || err);
    throw err;
  }
};

export const deleteCategory = async (categoryId) => {
  return axios.delete(`${BASE_URL}/admin/categories/${categoryId}`, {
    headers: getAuthHeaders(),
  });
};

export const fetchCategory = async () => {
  return axios.get(`${BASE_URL}/categories`, { headers: getAuthHeaders() });
};

export { fetchCategory as fetchCategories };

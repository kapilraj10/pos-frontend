import axios from "axios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Authorization": `Bearer ${token}`
  };
};

export const addCategory = async (formData) => {
  try {
    // NEVER set Content-Type for FormData - axios adds boundary automatically
    const res = await axios.post(
      "http://localhost:8080/api/v1/pos/admin/categories",
      formData,
      { headers: getAuthHeaders() }
    );
    return res;
  } catch (err) {
    console.error("CategoryService error:", err.response || err);
    throw err;
  }
};

export const deleteCategory = async (categoryId) => {
  return axios.delete(
    `http://localhost:8080/api/v1/pos/admin/categories/${categoryId}`,
    { headers: getAuthHeaders() }
  );
};

export const fetchCategory = async () => {
  return axios.get(
    'http://localhost:8080/api/v1/pos/categories',
    { headers: getAuthHeaders() }
  );
};

export { fetchCategory as fetchCategories };

import axios from "axios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Authorization": `Bearer ${token}`
  };
};

export const addUser = async (user) => {
  return await axios.post(
    "http://localhost:8080/api/v1/pos/admin/register",
    user,
    { headers: getAuthHeaders() }
  );
};

export const deleteUser = async (id) => {
  return await axios.delete(
    `http://localhost:8080/api/v1/pos/admin/users/${id}`,
    { headers: getAuthHeaders() }
  );
};

export const fetchUsers = async () => {
  return await axios.get(
    "http://localhost:8080/api/v1/pos/admin/users",
    { headers: getAuthHeaders() }
  );
};




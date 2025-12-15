import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1/pos";

export const login = async (data) => {
    return await axios.post(`${BASE_URL}/login`, data);
};
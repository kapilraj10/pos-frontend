import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1/pos";

export const login = async (data) => {
    return await axios.post(`${BASE_URL}/login`, data);
};

export const register = async (data) => {
    return await axios.post(`${BASE_URL}/register`, data);
};

export const requestOtp = async (email) => {
    return await axios.post(`${BASE_URL}/register/request-otp`, { email });
};

export const verifyOtpAndRegister = async (data) => {
    return await axios.post(`${BASE_URL}/register/verify-otp`, data);
};
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

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
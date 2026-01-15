import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

// Configure axios defaults for consistent headers
const axiosConfig = {
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Allow cookies/credentials for CORS
};

export const login = async (data) => {
    return await axios.post(`${BASE_URL}/login`, data, axiosConfig);
};

export const register = async (data) => {
    return await axios.post(`${BASE_URL}/register`, data, axiosConfig);
};

export const requestOtp = async (email) => {
    console.log("🔍 Requesting OTP for:", email);
    console.log("📡 API URL:", `${BASE_URL}/register/request-otp`);

    try {
        const response = await axios.post(
            `${BASE_URL}/register/request-otp`,
            { email },
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            }
        );
        console.log(" OTP request successful:", response.data);
        return response;
    } catch (error) {
        console.error(" OTP request failed:");
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
        console.error("Headers:", error.response?.headers);
        throw error;
    }
};

export const verifyOtpAndRegister = async (data) => {
    return await axios.post(`${BASE_URL}/register/verify-otp`, data, axiosConfig);
};
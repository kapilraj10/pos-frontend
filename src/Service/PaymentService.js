import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:8080/api/v1/pos";

export const initiateKhaltiPayment = async (order, returnUrl) => {
  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    console.log("🔍 Checking authentication:");
    console.log("   Token:", token ? `${token.substring(0, 20)}...` : "GUEST CHECKOUT");
    console.log("   Role:", role || "GUEST");
    console.log("   Mode:", token ? "AUTHENTICATED" : "GUEST");

    const payload = {
      order,
      return_url: returnUrl,
      website_url: window.location.origin,
    };

    console.log("Initiating Khalti payment with payload:", payload);

    // Prepare headers - add token only if user is logged in
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("   Auth token added to request");
    } else {
      console.log("   Guest checkout - no token");
    }

    const resp = await axios.post(`${BASE_URL}/payments/initiate`, payload, {
      headers: headers,
    });

    console.log("Khalti initiate response:", resp.data);
    return resp.data;
  } catch (err) {
    console.error("Khalti initiate error:", err);
    console.error("Error response:", err.response?.data);
    console.error("Error status:", err.response?.status);
    
    // Don't show auth errors for payment - it should work for guests
    toast.error(err.response?.data?.message || "Failed to start Khalti payment. Please try again.");
    throw err;
  }
};

export const lookupKhaltiPayment = async (pidx) => {
  try {
    const token = localStorage.getItem("token");
    
    // Prepare headers - add token only if available
    const headers = {
      "Content-Type": "application/json"
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("Lookup with authentication");
    } else {
      console.log("Lookup as guest");
    }

    const resp = await axios.post(
      `${BASE_URL}/payments/lookup`,
      { pidx },
      { headers }
    );
    
    console.log("Khalti lookup response:", resp.data);
    return resp.data;
  } catch (err) {
    console.error("Khalti lookup error:", err);
    console.error("Error response:", err.response?.data);
    
    // Don't show auth errors for payment lookup - it should work for guests
    toast.error(err.response?.data?.message || "Failed to validate payment. Please try again.");
    throw err;
  }
};

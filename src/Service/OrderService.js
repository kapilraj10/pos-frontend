import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

// Get token helper (only include header if token exists)
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch latest orders
export const latestOrders = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/orders/latest`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching latest orders:", error);
        throw error;
    }
};

// Create new order
export const createOrder = async (order) => {
    if (!order.cartItems || order.cartItems.length === 0) {
        toast.error("Cannot place order: Cart is empty!");
        throw new Error("Cart items cannot be empty");
    }

    try {
        const response = await axios.post(`${BASE_URL}/orders`, order, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            }
        });
        toast.success("Order placed successfully!");
        return response;
    } catch (error) {
        console.error("Error placing order:", error);
        toast.error("Failed to place order");
        throw error;
    }
};

// Delete order
export const deleteOrder = async (orderId) => {
    try {
        const response = await axios.delete(`${BASE_URL}/orders/${orderId}`, {
            headers: getAuthHeader()
        });
        toast.success("Order deleted successfully!");
        return response.data;
    } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete order");
        throw error;
    }
};

// Get user's own orders
export const getMyOrders = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/orders/my-orders`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching my orders:", error);
        throw error;
    }
};

// Update order status (admin only)
export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/orders/${orderId}/status`,
            { status },
            { headers: getAuthHeader() }
        );
        toast.success("Order status updated!");
        return response.data;
    } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("Failed to update order status");
        throw error;
    }
};

// Get all orders (admin only)
export const getAllOrders = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/orders`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching all orders:", error);
        throw error;
    }
};

// Get revenue statistics
export const getRevenueStats = async (period = 'all') => {
    try {
        const response = await axios.get(`${BASE_URL}/orders/stats/revenue`, {
            params: { period },
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching revenue stats:", error);
        throw error;
    }
};

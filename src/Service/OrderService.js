import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = 'http://localhost:8080/api/v1/pos';

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

import React, { useEffect, useState } from 'react';
import './OrderHistory.css';
import { getMyOrders } from '../../Service/OrderService.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const navigate = useNavigate();

    const fetchOrders = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            toast.info('Please login to view order history');
            navigate('/login');
            return;
        }
        try {
            const response = await getMyOrders();
            console.log("API response:", response);

            // Handle both direct array response and axios response
            const data = Array.isArray(response) ? response : (response?.data || []);

            // Filter out invalid orders and ensure data integrity
            const validOrders = data
                .filter(order => order && (order.orderId || order.customerName))
                .map(order => ({
                    orderId: order.orderId || `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    customerName: order.customerName || "Unknown Customer",
                    phoneNumber: order.phoneNumber || "N/A",
                    items: Array.isArray(order.items) ? order.items : [],
                    subtotal: order.subtotal || 0,
                    tax: order.tax || 0,
                    grandTotal: order.grandTotal || (order.subtotal || 0) + (order.tax || 0),
                    paymentMethod: order.paymentMethod || "UNKNOWN",
                    status: order.status || "COMPLETED",
                    createdAt: order.createdAt || new Date().toISOString()
                }))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by latest first

            setOrders(validOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                toast.error('Unauthorized. Please login again.');
                navigate('/login');
            } else {
                toast.error('Failed to load orders. Please try again.');
            }
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Helper function to calculate grand total
    const calculateGrandTotal = (order) => {
        if (order.grandTotal !== undefined && order.grandTotal !== null) {
            return order.grandTotal;
        }
        const subtotal = order.subtotal || 0;
        const tax = order.tax || 0;
        return subtotal + tax;
    };

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + calculateGrandTotal(order), 0);
    const cashOrders = orders.filter(order => order.paymentMethod === 'CASH').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const formatItems = (items = []) => {
        if (!Array.isArray(items) || items.length === 0) return "No items";

        const itemCount = items.length;
        const firstItem = items[0];
        const firstName = firstItem?.name || `Product ${firstItem?.productId || "Unknown"}`;
        const firstQuantity = firstItem?.quantity || 0;

        if (itemCount === 1) {
            return `${firstName} (x${firstQuantity})`;
        } else {
            return `${firstName} (x${firstQuantity}) + ${itemCount - 1} more`;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        try {
            const date = new Date(dateString);
            return isNaN(date.getTime())
                ? "Invalid Date"
                : date.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
        } catch (err) {
            console.error("Error formatting date:", dateString, err);
            return "Invalid Date";
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";

        try {
            const date = new Date(dateString);
            return isNaN(date.getTime())
                ? ""
                : date.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                });
        } catch {
            return "";
        }
    };

    const getPaymentBadgeClass = (method) => {
        const normalized = (method || '').toUpperCase();
        if (normalized === 'CASH') return 'payment-badge payment-cash';
        if (normalized === 'CARD' || normalized === 'CREDIT_CARD' || normalized === 'DEBIT_CARD')
            return 'payment-badge payment-card';
        if (normalized === 'ONLINE' || normalized === 'DIGITAL' || normalized === 'UPI')
            return 'payment-badge payment-online';
        return 'payment-badge payment-unknown';
    };

    const getStatusBadgeClass = (status) => {
        const normalized = (status || '').toUpperCase();
        if (normalized === 'COMPLETED' || normalized === 'DELIVERED') return 'order-status status-completed';
        if (normalized === 'PENDING' || normalized === 'PROCESSING') return 'order-status status-processing';
        if (normalized === 'READY') return 'order-status status-ready';
        if (normalized === 'CANCELLED' || normalized === 'FAILED') return 'order-status status-cancelled';
        return 'order-status status-processing';
    };

    // Print receipt function
    const printReceipt = (order) => {
        const printWindow = window.open('', '', 'height=600,width=400');
        printWindow.document.write('<html><head><title>Receipt - ' + order.orderId + '</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
            .receipt-header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .receipt-header h2 { margin: 5px 0; font-size: 20px; }
            .receipt-header p { margin: 2px 0; font-size: 12px; }
            .order-info { margin-bottom: 15px; font-size: 12px; }
            .order-info p { margin: 3px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .items-table th { text-align: left; border-bottom: 1px solid #000; padding: 5px 0; font-size: 11px; }
            .items-table td { padding: 5px 0; font-size: 11px; }
            .totals { border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; }
            .totals p { display: flex; justify-content: space-between; margin: 5px 0; font-size: 12px; }
            .grand-total { font-size: 14px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
            .footer { text-align: center; margin-top: 20px; border-top: 2px dashed #000; padding-top: 10px; font-size: 11px; }
            @media print { body { padding: 0; } }
        `);
        printWindow.document.write('</style></head><body>');

        // Receipt Header
        printWindow.document.write('<div class="receipt-header">');
        printWindow.document.write('<h2>POS SYSTEM</h2>');
        printWindow.document.write('<p>Order Receipt</p>');
        printWindow.document.write('</div>');

        // Order Info
        printWindow.document.write('<div class="order-info">');
        printWindow.document.write('<p><strong>Order ID:</strong> ' + order.orderId + '</p>');
        printWindow.document.write('<p><strong>Customer:</strong> ' + order.customerName + '</p>');
        printWindow.document.write('<p><strong>Phone:</strong> ' + order.phoneNumber + '</p>');
        printWindow.document.write('<p><strong>Date:</strong> ' + formatDate(order.createdAt) + ' ' + formatTime(order.createdAt) + '</p>');
        printWindow.document.write('<p><strong>Status:</strong> ' + (order.status || 'PENDING') + '</p>');
        printWindow.document.write('<p><strong>Payment:</strong> ' + order.paymentMethod + '</p>');
        printWindow.document.write('</div>');

        // Items Table
        printWindow.document.write('<table class="items-table">');
        printWindow.document.write('<thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>');
        printWindow.document.write('<tbody>');

        (order.items || []).forEach(item => {
            const itemTotal = (item.price || 0) * (item.quantity || 0);
            printWindow.document.write('<tr>');
            printWindow.document.write('<td>' + item.name + '</td>');
            printWindow.document.write('<td>' + item.quantity + '</td>');
            printWindow.document.write('<td>Rs. ' + (item.price || 0).toFixed(2) + '</td>');
            printWindow.document.write('<td>Rs. ' + itemTotal.toFixed(2) + '</td>');
            printWindow.document.write('</tr>');
        });

        printWindow.document.write('</tbody></table>');

        // Totals
        printWindow.document.write('<div class="totals">');
        printWindow.document.write('<p><span>Subtotal:</span><span>Rs. ' + (order.subtotal || 0).toFixed(2) + '</span></p>');
        printWindow.document.write('<p><span>Tax:</span><span>Rs. ' + (order.tax || 0).toFixed(2) + '</span></p>');
        printWindow.document.write('<p class="grand-total"><span>Grand Total:</span><span>Rs. ' + (order.grandTotal || 0).toFixed(2) + '</span></p>');
        printWindow.document.write('</div>');

        // Footer
        printWindow.document.write('<div class="footer">');
        printWindow.document.write('<p>Thank you for your order!</p>');
        printWindow.document.write('<p>Visit again soon</p>');
        printWindow.document.write('</div>');

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    // Filter orders based on search, status, and payment filter
    const filteredOrders = orders.filter(order => {
        const matchesSearch = searchTerm === '' ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.phoneNumber.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' ||
            (order.status || 'PENDING').toLowerCase() === statusFilter.toLowerCase();

        const matchesPayment = paymentFilter === 'all' ||
            order.paymentMethod.toLowerCase() === paymentFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesPayment;
    });

    if (loading) {
        return (
            <div className="orders-history-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="orders-history-container">
                <div className="empty-state">
                    <div className="empty-icon">
                        <i className="bi bi-receipt"></i>
                    </div>
                    <h3 className="empty-title">No Orders Found</h3>
                    <p className="empty-subtitle">
                        There are no orders to display. Start accepting orders to see them here.
                    </p>
                    <button className="refresh-button" onClick={fetchOrders}>
                        <i className="bi bi-arrow-clockwise"></i>
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-history-container">
            {/* Header */}
            <div className="orders-header">
                <div>
                    <h1 className="orders-title">
                        <i className="bi bi-clock-history"></i>
                        Order History
                    </h1>
                    <p className="text-muted">View and manage all your recent orders</p>
                </div>
                <div className="search-filter-container">
                    <div className="search-box">
                        <i className="bi bi-search search-icon"></i>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="filter-select"
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                    >
                        <option value="all">All Payment Methods</option>
                        <option value="cash">Cash</option>
                        <option value="khalti">Khalti</option>
                        <option value="card">Card</option>
                        <option value="online">Online</option>
                    </select>
                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="bi bi-receipt"></i>
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-value">{totalOrders}</h3>
                        <p className="stat-label">Total Orders</p>
                        <div className="stat-change">
                            <i className="bi bi-graph-up"></i>
                            <span>+12% this month</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="bi bi-currency-rupee"></i>
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-value">रु {totalRevenue.toFixed(2)}</h3>
                        <p className="stat-label">Total Revenue</p>
                        <div className="stat-change">
                            <i className="bi bi-graph-up"></i>
                            <span>+8% this month</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="bi bi-cash"></i>
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-value">{cashOrders}</h3>
                        <p className="stat-label">Cash Orders</p>
                        <div className="stat-change">
                            <i className="bi bi-graph-up"></i>
                            <span>+5% this month</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="bi bi-cart-check"></i>
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-value">रु {averageOrderValue.toFixed(2)}</h3>
                        <p className="stat-label">Avg. Order Value</p>
                        <div className="stat-change">
                            <i className="bi bi-graph-up"></i>
                            <span>+3% this month</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="orders-table-container">
                <div style={{ overflowX: 'auto' }}>
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Date & Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order, index) => (
                                <tr key={order.orderId || `order-${index}`}>
                                    <td className="order-id-cell">
                                        <div style={{ fontWeight: '500' }}>{order.orderId}</div>
                                        <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '4px' }}>
                                            #{index + 1}
                                        </div>
                                    </td>
                                    <td className="customer-cell">
                                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                            {order.customerName}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#a0aec0' }}>
                                            <i className="bi bi-telephone me-1"></i>
                                            {order.phoneNumber}
                                        </div>
                                    </td>
                                    <td className="items-cell">
                                        <div style={{ marginBottom: '4px' }}>
                                            {formatItems(order.items)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                                            {order.items?.length || 0} items
                                        </div>
                                    </td>
                                    <td className="amount-cell">
                                        <div style={{ fontWeight: '600', fontSize: '16px', color: '#48bb78' }}>
                                            रु {calculateGrandTotal(order).toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                                            Subtotal: रु {(order.subtotal || 0).toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="payment-cell">
                                        <span className={getPaymentBadgeClass(order.paymentMethod)}>
                                            <i className={`bi ${order.paymentMethod === 'CASH' ? 'bi-cash' : 'bi-credit-card'}`}></i>
                                            {order.paymentMethod || 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={getStatusBadgeClass(order.status)}>
                                            <i className="bi bi-circle-fill" style={{ fontSize: '6px' }}></i>
                                            {order.status || 'PROCESSING'}
                                        </span>
                                    </td>
                                    <td className="date-cell">
                                        <div style={{ fontWeight: '500' }}>{formatDate(order.createdAt)}</div>
                                        <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                                            {formatTime(order.createdAt)}
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => printReceipt(order)}
                                            title="Print Receipt"
                                        >
                                            <i className="bi bi-printer"></i> Print
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Summary */}
            {filteredOrders.length > 0 && (
                <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div style={{ color: '#a0aec0', fontSize: '14px' }}>
                        Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ fontSize: '14px', color: '#a0aec0' }}>
                            Filtered Revenue: <strong style={{ color: '#48bb78' }}>
                                रु {filteredOrders.reduce((sum, order) => sum + calculateGrandTotal(order), 0).toFixed(2)}
                            </strong>
                        </div>
                        <button
                            className="refresh-button"
                            onClick={fetchOrders}
                            style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            Refresh
                        </button>
                    </div>
                </div>
            )}

            {filteredOrders.length === 0 && searchTerm && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#a0aec0',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    marginTop: '20px'
                }}>
                    <i className="bi bi-search" style={{ fontSize: '32px', marginBottom: '16px', display: 'block' }}></i>
                    <h4 style={{ marginBottom: '8px' }}>No matching orders found</h4>
                    <p>Try adjusting your search or filter criteria</p>
                    <button
                        style={{
                            background: 'transparent',
                            border: '1px solid #4a5568',
                            color: '#a0aec0',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginTop: '16px'
                        }}
                        onClick={() => {
                            setSearchTerm('');
                            setPaymentFilter('all');
                        }}
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
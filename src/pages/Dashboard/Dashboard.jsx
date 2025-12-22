import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { fetchDashboardData } from '../../Service/Dashboard';
import OrdersTable from '../../components/OrdersTable/OrdersTable';

const MOCK_ORDERS = [
    { id: 1, customer: "John Doe", items: 3, total: 2500, status: "COMPLETED", paymentMethod: "khalti", date: new Date(Date.now() - 86400000) },
    { id: 2, customer: "Jane Smith", items: 2, total: 1500, status: "PENDING", paymentMethod: "cash", date: new Date(Date.now() - 172800000) },
    { id: 3, customer: "Bob Johnson", items: 5, total: 4500, status: "COMPLETED", paymentMethod: "khalti", date: new Date(Date.now() - 259200000) },
];

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        averageOrderValue: 0
    });

    // Mock fallback orders (kept locally for offline fallback)
    // use module-level MOCK_ORDERS to avoid effect dependencies

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetchDashboardData();
                const payload = res?.data || {};

                // If API provides recentOrders in expected format, map to our shape
                if (Array.isArray(payload.recentOrders) && payload.recentOrders.length > 0) {
                    const mapped = payload.recentOrders.map((o, index) => ({
                        id: o.orderId ?? o.id ?? index,
                        customer: o.customerName ?? o.customer ?? 'Unknown',
                        items: Array.isArray(o.items) ? o.items.length : (o.itemsCount ?? 0),
                        total: o.grandTotal ?? o.total ?? 0,
                        status: (o.status || 'UNKNOWN').toString(),
                        paymentMethod: (o.paymentMethod || o.payment_type || 'unknown').toString().toLowerCase(),
                        date: o.createdAt ? new Date(o.createdAt) : (o.date ? new Date(o.date) : new Date())
                    }));

                    setOrders(mapped);
                    setFilteredOrders(mapped);
                    calculateStats(mapped);
                } else {
                    // fallback to API-provided summary metrics if available
                    if (payload.todaySales || payload.todayOrderCount) {
                        const revenue = payload.todaySales || 0;
                        const orderCount = payload.todayOrderCount || 0;
                        const uniqueCustomers = payload.totalCustomers || 0;
                        const avg = orderCount > 0 ? revenue / orderCount : 0;
                        setStats({ totalRevenue: revenue, totalOrders: orderCount, totalCustomers: uniqueCustomers, averageOrderValue: avg });
                    }

                    // Use mock orders in absence of recentOrders
                    setOrders(MOCK_ORDERS);
                    setFilteredOrders(MOCK_ORDERS);
                    calculateStats(MOCK_ORDERS);
                }
            } catch (err) {
                console.error('Dashboard load failed, using mock data', err);
                // fallback to mock orders
                setOrders(MOCK_ORDERS);
                setFilteredOrders(MOCK_ORDERS);
                calculateStats(MOCK_ORDERS);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    useEffect(() => {
        // Filter only by payment method (date filters removed)
        let filtered = [...orders];

        if (paymentFilter !== 'all') {
            filtered = filtered.filter(order => order.paymentMethod === paymentFilter);
        }

        setFilteredOrders(filtered);
        calculateStats(filtered);
    }, [paymentFilter, orders]);

    const calculateStats = (orderList) => {
        const totalRevenue = orderList.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orderList.length;
        const uniqueCustomers = [...new Set(orderList.map(order => order.customer))].length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        setStats({
            totalRevenue,
            totalOrders,
            totalCustomers: uniqueCustomers,
            averageOrderValue
        });
    };



    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getPaymentMethodCount = (method) => {
        return orders.filter(order => order.paymentMethod === method).length;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="filter-controls">
                    <div className="payment-filters">
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="payment-select"
                        >
                            <option value="all">All Payments</option>
                            <option value="khalti">Khalti Only</option>
                            <option value="cash">Cash Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon revenue">
                        <i className="bi bi-cash-coin"></i>
                    </div>
                    <div className="stat-content">
                        <h3>Total Revenue</h3>
                        <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
                        <p className="stat-desc">{filteredOrders.length} orders</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orders">
                        <i className="bi bi-cart-check"></i>
                    </div>
                    <div className="stat-content">
                        <h3>Total Orders</h3>
                        <p className="stat-value">{stats.totalOrders}</p>
                        <p className="stat-desc">
                            {filteredOrders.filter(o => o.status === 'COMPLETED').length} completed
                        </p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon customers">
                        <i className="bi bi-people"></i>
                    </div>
                    <div className="stat-content">
                        <h3>Total Customers</h3>
                        <p className="stat-value">{stats.totalCustomers}</p>
                        <p className="stat-desc">Active customers</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon avg">
                        <i className="bi bi-graph-up"></i>
                    </div>
                    <div className="stat-content">
                        <h3>Average Order</h3>
                        <p className="stat-value">{formatCurrency(stats.averageOrderValue)}</p>
                        <p className="stat-desc">Per order</p>
                    </div>
                </div>
            </div>

            {/* Payment Summary */}
            <div className="payment-summary">
                <h2>Payment Method Summary</h2>
                <div className="payment-cards">
                    <div className="payment-card khalti">
                        <i className="bi bi-phone"></i>
                        <div>
                            <h3>Khalti Payments</h3>
                            <p>{getPaymentMethodCount('khalti')} orders</p>
                        </div>
                    </div>
                    <div className="payment-card cash">
                        <i className="bi bi-cash"></i>
                        <div>
                            <h3>Cash Payments</h3>
                            <p>{getPaymentMethodCount('cash')} orders</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="orders-section">
                <div className="section-header">
                    <h2>Recent Orders</h2>
                    <span className="order-count">{filteredOrders.length} orders found</span>
                </div>

                <OrdersTable orders={filteredOrders} formatCurrency={formatCurrency} />
            </div>

            {/* Footer removed as per request (filter summary and reset removed) */}
        </div>
    );
};

export default Dashboard;
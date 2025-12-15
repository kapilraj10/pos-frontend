import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Dashboard.css';
import { fetchDashboardData } from '../../Service/Dashboard.js';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('today');
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetchDashboardData();
                console.log("Dashboard response:", response.data);
                setData(response.data);
            } catch (error) {
                console.error("Dashboard error:", error);
                if (error?.response?.status === 401 || error?.response?.status === 403) {
                    toast.error("Please login to view dashboard");
                } else {
                    toast.error("Unable to load dashboard data");
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const calculateMetrics = () => {
        if (!data) return {};
        
        const recentOrders = data.recentOrders || [];
        const todaySales = data.todaySales || 0;
        const todayOrderCount = data.todayOrderCount || 0;
        
        // Calculate metrics
        const totalCustomers = [...new Set(recentOrders.map(order => order.customerName))].length;
        const averageOrderValue = todayOrderCount > 0 ? todaySales / todayOrderCount : 0;
        const completedOrders = recentOrders.filter(order => order.status === 'COMPLETED' || order.status === 'DELIVERED').length;
        
        return {
            totalCustomers,
            averageOrderValue,
            completedOrders
        };
    };

    const getTrendData = () => {
        return {
            sales: { value: 12, isPositive: true },
            orders: { value: 8, isPositive: true },
            customers: { value: 5, isPositive: true },
            revenue: { value: 15, isPositive: true }
        };
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-animation">
                    <div className="loading-circle"></div>
                    <div className="loading-circle"></div>
                    <div className="loading-circle"></div>
                </div>
                <h3 className="loading-title">Loading Dashboard</h3>
                <p className="loading-subtitle">Fetching the latest insights...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="dashboard-error">
                <div className="error-illustration">
                    <i className="bi bi-exclamation-octagon"></i>
                </div>
                <h3 className="error-title">Unable to Load Dashboard</h3>
                <p className="error-message">Please check your connection and try again</p>
                <button 
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    <i className="bi bi-arrow-clockwise"></i>
                    Retry
                </button>
            </div>
        );
    }

    const metrics = calculateMetrics();
    const trends = getTrendData();

    return (
        <div className="dashboard-wrapper">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1 className="dashboard-title">Dashboard Overview</h1>
                    <p className="dashboard-subtitle">Welcome back! Here's what's happening with your store today.</p>
                </div>
                <div className="header-right">
                    <div className="time-selector">
                        <button 
                            className={`time-btn ${timeRange === 'today' ? 'active' : ''}`}
                            onClick={() => setTimeRange('today')}
                        >
                            Today
                        </button>
                        <button 
                            className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
                            onClick={() => setTimeRange('week')}
                        >
                            This Week
                        </button>
                        <button 
                            className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
                            onClick={() => setTimeRange('month')}
                        >
                            This Month
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card sales">
                    <div className="stat-header">
                        <div className="stat-icon">
                            <i className="bi bi-currency-rupee"></i>
                        </div>
                        <div className="stat-trend">
                            <i className={`bi ${trends.sales.isPositive ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                            <span className={`trend-value ${trends.sales.isPositive ? 'positive' : 'negative'}`}>
                                {trends.sales.value}%
                            </span>
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-label">Total Revenue</h3>
                        <p className="stat-value">रु {data.todaySales?.toFixed(2) || '0.00'}</p>
                        <p className="stat-description">From {data.todayOrderCount || 0} orders</p>
                    </div>
                </div>

                <div className="stat-card orders">
                    <div className="stat-header">
                        <div className="stat-icon">
                            <i className="bi bi-cart-check"></i>
                        </div>
                        <div className="stat-trend">
                            <i className={`bi ${trends.orders.isPositive ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                            <span className={`trend-value ${trends.orders.isPositive ? 'positive' : 'negative'}`}>
                                {trends.orders.value}%
                            </span>
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-label">Total Orders</h3>
                        <p className="stat-value">{data.todayOrderCount || 0}</p>
                        <p className="stat-description">{metrics.completedOrders} completed</p>
                    </div>
                </div>

                <div className="stat-card customers">
                    <div className="stat-header">
                        <div className="stat-icon">
                            <i className="bi bi-people"></i>
                        </div>
                        <div className="stat-trend">
                            <i className={`bi ${trends.customers.isPositive ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                            <span className={`trend-value ${trends.customers.isPositive ? 'positive' : 'negative'}`}>
                                {trends.customers.value}%
                            </span>
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-label">Total Customers</h3>
                        <p className="stat-value">{metrics.totalCustomers}</p>
                        <p className="stat-description">Active this period</p>
                    </div>
                </div>

                <div className="stat-card avg-order">
                    <div className="stat-header">
                        <div className="stat-icon">
                            <i className="bi bi-graph-up"></i>
                        </div>
                        <div className="stat-trend">
                            <i className={`bi ${trends.revenue.isPositive ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                            <span className={`trend-value ${trends.revenue.isPositive ? 'positive' : 'negative'}`}>
                                {trends.revenue.value}%
                            </span>
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-label">Avg. Order Value</h3>
                        <p className="stat-value">रु {metrics.averageOrderValue.toFixed(2)}</p>
                        <p className="stat-description">Compared to last period</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Recent Orders Section */}
                <div className="content-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <i className="bi bi-clock-history"></i>
                            Recent Orders
                        </h3>
                        <button className="section-action">
                            View All <i className="bi bi-arrow-right"></i>
                        </button>
                    </div>
                    <div className="recent-orders-container">
                        {data.recentOrders && data.recentOrders.length > 0 ? (
                            <div className="orders-table-wrapper">
                                <table className="orders-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.recentOrders.map((order, index) => (
                                            <tr key={order.orderId || index}>
                                                <td>
                                                    <div className="order-id-cell">
                                                        <span className="order-id">#{order.orderId?.substring(0, 8)}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="customer-cell">
                                                        <div className="customer-name">{order.customerName || 'Unknown'}</div>
                                                        <div className="customer-contact">{order.phoneNumber || 'N/A'}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="items-cell">
                                                        {order.items?.length || 0} items
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="amount-cell">
                                                        रु {order.grandTotal?.toFixed(2) || '0.00'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={`status-badge ${(order.paymentMethod || '').toLowerCase()}`}>
                                                        {order.paymentMethod || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="time-cell">
                                                        {order.createdAt 
                                                            ? new Date(order.createdAt).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                            : 'N/A'
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-orders">
                                <div className="empty-illustration">
                                    <i className="bi bi-cart"></i>
                                </div>
                                <h4>No Recent Orders</h4>
                                <p>Start taking orders to see them here</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

        
            
        </div>
    );
};

export default Dashboard;
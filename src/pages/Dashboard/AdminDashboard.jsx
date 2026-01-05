import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus, deleteOrder, getRevenueStats } from '../../Service/OrderService';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [stats, setStats] = useState({
        todayRevenue: 0,
        last7DaysRevenue: 0,
        last15DaysRevenue: 0,
        monthlyRevenue: 0,
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        readyOrders: 0,
        deliveredOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
    });
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        fetchOrders();
        fetchStats(); // Fetch stats from backend
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await getRevenueStats();

            // Update stats from backend
            setStats({
                todayRevenue: data.todayRevenue || 0,
                last7DaysRevenue: data.last7DaysRevenue || 0,
                last15DaysRevenue: data.last15DaysRevenue || 0,
                monthlyRevenue: data.monthlyRevenue || 0,
                totalRevenue: data.totalRevenue || 0,
                totalOrders: data.totalOrders || 0,
                pendingOrders: data.pendingOrders || 0,
                processingOrders: data.processingOrders || 0,
                readyOrders: data.readyOrders || 0,
                deliveredOrders: data.deliveredOrders || 0,
                completedOrders: data.completedOrders || 0,
                cancelledOrders: data.cancelledOrders || 0,
            });

            // Update chart data from backend
            if (data.chartData && Array.isArray(data.chartData)) {
                const formattedChartData = data.chartData.map(day => ({
                    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: day.revenue || 0,
                    orders: day.orders || 0
                }));
                setChartData(formattedChartData);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
            toast.error('Failed to load statistics');
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedOrder || !newStatus) return;

        try {
            // Backend expects the string orderId (e.g. ORD163234234), not DB numeric id
            await updateOrderStatus(selectedOrder.orderId, newStatus);
            await fetchOrders();
            await fetchStats(); // Refresh stats after status update
            setShowStatusModal(false);
            setSelectedOrder(null);
            setNewStatus('');
            toast.success('Order status updated successfully');
        } catch (error) {
            console.error('Failed to update status', error);
            toast.error('Failed to update order status');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;

        try {
            await deleteOrder(orderId);
            await fetchOrders();
            await fetchStats(); // Refresh stats after deletion
            toast.success('Order deleted successfully');
        } catch (error) {
            console.error('Failed to delete order', error);
            toast.error('Failed to delete order');
        }
    };

    const exportToExcel = () => {
        const exportData = filteredOrders.map(order => ({
            'Order ID': order.orderId,
            'Customer Name': order.customerName,
            'Phone': order.phoneNumber,
            'Status': order.status,
            'Payment Method': order.paymentMethod,
            'Subtotal': order.subtotal || order.subTotal || 0,
            'Tax': order.tax || 0,
            'Grand Total': order.grandTotal,
            'Date': new Date(order.createdAt).toLocaleDateString(),
            'Time': new Date(order.createdAt).toLocaleTimeString(),
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Orders');

        const filename = `orders_${period}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, filename);
        toast.success('Orders exported successfully!');
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'bg-warning text-dark';
            case 'PROCESSING': return 'bg-info text-white';
            case 'READY': return 'bg-primary text-white';
            case 'DELIVERED': return 'bg-success text-white';
            case 'COMPLETED': return 'bg-success text-white';
            case 'CANCELLED': return 'bg-danger text-white';
            default: return 'bg-secondary text-white';
        }
    };

    const getPaymentBadgeClass = (method) => {
        switch (method?.toLowerCase()) {
            case 'cash': return 'bg-warning text-dark';
            case 'khalti': return 'bg-purple text-white';
            case 'card': return 'bg-info text-white';
            default: return 'bg-secondary text-white';
        }
    };

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Period filter
        if (period === 'today' && orderDate < today) return false;
        if (period === 'week' && orderDate < new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) return false;
        if (period === 'month' && orderDate < new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) return false;

        // Status filter
        if (statusFilter !== 'all' && order.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;

        // Payment filter
        if (paymentFilter !== 'all' && order.paymentMethod?.toLowerCase() !== paymentFilter.toLowerCase()) return false;

        // Search filter
        if (searchTerm && !(
            order.orderId?.toString().includes(searchTerm) ||
            order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.phoneNumber?.includes(searchTerm)
        )) return false;

        return true;
    });

    if (loading) {
        return (
            <div className="container-fluid py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-wrapper">
            <div className="container-fluid px-3 px-md-4 py-4">
                {/* Header */}
                <div className="row mb-4 align-items-center">
                    <div className="col-md-6 mb-3 mb-md-0">
                        <h2 className="h3 fw-bold mb-1">
                            <i className="bi bi-speedometer2 text-primary me-2"></i>
                            Admin Dashboard
                        </h2>
                        <p className="text-muted mb-0">Comprehensive order management and revenue analytics</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <button
                            className="btn btn-success btn-lg shadow-sm"
                            onClick={exportToExcel}
                            disabled={filteredOrders.length === 0}
                        >
                            <i className="bi bi-file-earmark-excel me-2"></i>
                            Export to Excel
                        </button>
                    </div>
                </div>

                {/* Revenue Stats Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-xl-2 col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100 stats-card">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <small className="text-muted d-block mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Today</small>
                                        <h5 className="fw-bold mb-0 text-success" style={{ fontSize: '1.1rem' }}>
                                            रु {stats.todayRevenue.toFixed(2)}
                                        </h5>
                                    </div>
                                    <div className="bg-success bg-opacity-10 rounded-circle p-2" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-calendar-day text-success fs-5"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100 stats-card">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <small className="text-muted d-block mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>7 Days</small>
                                        <h5 className="fw-bold mb-0 text-info" style={{ fontSize: '1.1rem' }}>
                                            रु {stats.last7DaysRevenue.toFixed(2)}
                                        </h5>
                                    </div>
                                    <div className="bg-info bg-opacity-10 rounded-circle p-2" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-calendar-week text-info fs-5"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100 stats-card">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <small className="text-muted d-block mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>15 Days</small>
                                        <h5 className="fw-bold mb-0 text-warning" style={{ fontSize: '1.1rem' }}>
                                            रु {stats.last15DaysRevenue.toFixed(2)}
                                        </h5>
                                    </div>
                                    <div className="bg-warning bg-opacity-10 rounded-circle p-2" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-calendar2-range text-warning fs-5"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100 stats-card">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <small className="text-muted d-block mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Monthly</small>
                                        <h5 className="fw-bold mb-0 text-primary" style={{ fontSize: '1.1rem' }}>
                                            रु {stats.monthlyRevenue.toFixed(2)}
                                        </h5>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-calendar-month text-primary fs-5"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100 stats-card">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <small className="text-muted d-block mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Total</small>
                                        <h5 className="fw-bold mb-0 text-danger" style={{ fontSize: '1.1rem' }}>
                                            रु {stats.totalRevenue.toFixed(2)}
                                        </h5>
                                    </div>
                                    <div className="bg-danger bg-opacity-10 rounded-circle p-2" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-cash-stack text-danger fs-5"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Stats Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-xl-2 col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100 stats-card">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <h4 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>{stats.totalOrders}</h4>
                                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Total Orders</small>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-receipt text-primary fs-5"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100 stats-card">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <h4 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>{stats.pendingOrders}</h4>
                                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Pending</small>
                                    </div>
                                    <div className="bg-warning bg-opacity-10 rounded-circle p-2" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-clock text-warning fs-5"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100 stats-card">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <h4 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>{stats.processingOrders}</h4>
                                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Processing</small>
                                    </div>
                                    <div className="bg-info bg-opacity-10 rounded-circle p-2" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-arrow-repeat text-info fs-5"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100 stats-card">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <h4 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>{stats.readyOrders}</h4>
                                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Ready</small>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-box-seam text-primary fs-5"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100 stats-card">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <h4 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>{stats.deliveredOrders}</h4>
                                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Delivered</small>
                                    </div>
                                    <div className="bg-success bg-opacity-10 rounded-circle p-2" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-check-circle text-success fs-5"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-2 col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100 stats-card">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <h4 className="fw-bold mb-1" style={{ fontSize: '1.5rem' }}>{stats.cancelledOrders}</h4>
                                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Cancelled</small>
                                    </div>
                                    <div className="bg-danger bg-opacity-10 rounded-circle p-2" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-x-circle text-danger fs-5"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Charts */}
                <div className="row g-3 mb-4">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-3">
                                    <i className="bi bi-graph-up text-primary me-2"></i>
                                    Revenue Trend (Last 7 Days)
                                </h5>
                                <ResponsiveContainer width="100%" height={320}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="date" style={{ fontSize: '0.85rem' }} />
                                        <YAxis style={{ fontSize: '0.85rem' }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #ddd' }} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#0d6efd"
                                            strokeWidth={3}
                                            name="Revenue (रु)"
                                            dot={{ fill: '#0d6efd', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-3">
                                    <i className="bi bi-bar-chart text-success me-2"></i>
                                    Order Status
                                </h5>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={[
                                        { name: 'Pending', value: stats.pendingOrders, fill: '#ffc107' },
                                        { name: 'Processing', value: stats.processingOrders, fill: '#0dcaf0' },
                                        { name: 'Ready', value: stats.readyOrders, fill: '#0d6efd' },
                                        { name: 'Delivered', value: stats.deliveredOrders, fill: '#198754' },
                                        { name: 'Cancelled', value: stats.cancelledOrders, fill: '#dc3545' },
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="name" style={{ fontSize: '0.75rem' }} angle={-15} textAnchor="end" height={60} />
                                        <YAxis style={{ fontSize: '0.85rem' }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #ddd' }} />
                                        <Bar dataKey="value" name="Orders" fill="#0d6efd" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Table - Full Screen */}
                <div className="orders-table-fullscreen">
                    <div className="table-header-fixed">
                        <div className="px-4 py-3 bg-white border-bottom">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <h5 className="mb-0 fw-bold">
                                        <i className="bi bi-table text-primary me-2"></i>
                                        Orders Management
                                    </h5>
                                    <small className="text-muted">
                                        {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
                                    </small>
                                </div>
                            </div>

                            {/* Compact Filters Inside Table */}
                            <div className="row g-2">
                                <div className="col-lg-3 col-md-6">
                                    <select
                                        className="form-select form-select-sm"
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value)}
                                    >
                                        <option value="all"> All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month"> This Month</option>
                                    </select>
                                </div>

                                <div className="col-lg-2 col-md-6">
                                    <select
                                        className="form-select form-select-sm"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="ready">Ready</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled"> Cancelled</option>
                                    </select>
                                </div>

                                <div className="col-lg-2 col-md-6">
                                    <select
                                        className="form-select form-select-sm"
                                        value={paymentFilter}
                                        onChange={(e) => setPaymentFilter(e.target.value)}
                                    >
                                        <option value="all">All Payments</option>
                                        <option value="cash"> Cash</option>
                                        <option value="khalti"> Khalti</option>
                                    </select>
                                </div>

                                <div className="col-lg-4 col-md-6">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="🔍 Search Order ID, Customer, Phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="col-lg-1 col-md-12">
                                    {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || period !== 'all') && (
                                        <button
                                            className="btn btn-sm btn-outline-secondary w-100"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setStatusFilter('all');
                                                setPaymentFilter('all');
                                                setPeriod('all');
                                            }}
                                            title="Clear filters"
                                        >
                                            <i className="bi bi-x-circle"></i> Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="table-container-scrollable">
                        {filteredOrders.length === 0 ? (
                            <div className="empty-state-fullscreen">
                                <div className="mb-4">
                                    <i className="bi bi-inbox text-muted" style={{ fontSize: '5rem', opacity: 0.3 }}></i>
                                </div>
                                <h4 className="text-muted mb-3 fw-bold">No Orders Found</h4>
                                <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
                                    {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || period !== 'all'
                                        ? 'Try adjusting your filters to see more results'
                                        : 'Orders will appear here once customers place them'
                                    }
                                </p>
                                {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' || period !== 'all') && (
                                    <button
                                        className="btn btn-primary btn-lg shadow"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStatusFilter('all');
                                            setPaymentFilter('all');
                                            setPeriod('all');
                                        }}
                                    >
                                        <i className="bi bi-x-circle me-2"></i>
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="table-scroll-wrapper">
                                <table className="table table-hover align-middle mb-0 orders-table">
                                    <thead className="table-header-sticky">
                                        <tr>
                                            <th className="ps-4 py-3 fw-semibold">Order ID</th>
                                            <th className="py-3 fw-semibold">Customer</th>
                                            <th className="py-3 fw-semibold">Phone</th>
                                            <th className="py-3 fw-semibold">Status</th>
                                            <th className="py-3 fw-semibold">Payment</th>
                                            <th className="py-3 fw-semibold">Total</th>
                                            <th className="py-3 fw-semibold">Date</th>
                                            <th className="text-end pe-4 py-3 fw-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map(order => (
                                            <tr key={order.orderId} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                <td className="ps-4 py-3">
                                                    <span className="fw-semibold text-primary">#{order.orderId}</span>
                                                </td>
                                                <td className="py-3">
                                                    <div className="fw-semibold">{order.customerName}</div>
                                                </td>
                                                <td className="py-3">{order.phoneNumber}</td>
                                                <td className="py-3">
                                                    <span className={`badge ${getStatusBadgeClass(order.status)} px-3 py-2`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`badge ${getPaymentBadgeClass(order.paymentMethod)} px-3 py-2`}>
                                                        {order.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="py-3 fw-bold text-success">रु {order.grandTotal?.toFixed(2)}</td>
                                                <td className="py-3">
                                                    <div>
                                                        <div className="fw-semibold small">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                            {new Date(order.createdAt).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-end pe-4 py-3">
                                                    <div className="btn-group">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setNewStatus(order.status);
                                                                setShowStatusModal(true);
                                                            }}
                                                            title="Update Status"
                                                        >
                                                            <i className="bi bi-pencil-square"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteOrder(order.orderId)}
                                                            title="Delete Order"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Update Modal */}
                {showStatusModal && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content shadow-lg border-0">
                                <div className="modal-header border-bottom-0 pb-0">
                                    <h5 className="modal-title fw-bold">
                                        <i className="bi bi-pencil-square text-primary me-2"></i>
                                        Update Order Status
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowStatusModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body pt-2">
                                    <p className="mb-3 text-muted">
                                        Order ID: <strong className="text-primary">#{selectedOrder?.orderId}</strong>
                                    </p>
                                    <label className="form-label fw-semibold">Select New Status</label>
                                    <select
                                        className="form-select form-select-lg"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                    >
                                        <option value="PENDING"> Pending</option>
                                        <option value="PROCESSING"> Processing</option>
                                        <option value="READY"> Ready</option>
                                        <option value="DELIVERED"> Delivered</option>
                                        <option value="CANCELLED"> Cancelled</option>
                                    </select>
                                </div>
                                <div className="modal-footer border-top-0">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowStatusModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleStatusUpdate}
                                    >
                                        <i className="bi bi-check2-circle me-1"></i>
                                        Update Status
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

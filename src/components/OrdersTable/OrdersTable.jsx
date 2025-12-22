import React from 'react';

const OrdersTable = ({ orders = [], formatCurrency = (v) => v }) => {
    return (
        <div className="orders-table-container">
            <table className="orders-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Payment Method</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {orders && orders.length > 0 ? (
                        orders.map(order => (
                            <tr key={order.id}>
                                <td>#{String(order.id).padStart(6, '0')}</td>
                                <td>{order.customer}</td>
                                <td>{order.items} items</td>
                                <td>{formatCurrency(order.total)}</td>
                                <td>
                                    <span className={`payment-badge ${order.paymentMethod}`}>
                                        {String(order.paymentMethod).toUpperCase()}
                                    </span>
                                </td>
                                <td>{order.date instanceof Date ? order.date.toLocaleDateString() : String(order.date)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="no-orders">
                                <i className="bi bi-inbox"></i>
                                <p>No orders found for the selected filters</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OrdersTable;

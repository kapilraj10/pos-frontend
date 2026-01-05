import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        setUserRole(role || '');
    }, []);

    const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';

    if (!isAdmin) return null;

    const menuItems = [
        {
            path: '/dashboard',
            icon: 'bi-speedometer2',
            label: 'Dashboard'
        },
        {
            path: '/manage-items',
            icon: 'bi-box-seam',
            label: 'Manage Items'
        },
        {
            path: '/manage-category',
            icon: 'bi-tags',
            label: 'Manage Category'
        },
        {
            path: '/manage-users',
            icon: 'bi-people',
            label: 'Manage Users'
        }
    ];

    return (
        <div className="admin-sidebar">
            <div className="sidebar-header">
                <h5 className="mb-0">
                    <i className="bi bi-shield-check me-2"></i>
                    Admin Panel
                </h5>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <i className={`bi ${item.icon} me-3`}></i>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;

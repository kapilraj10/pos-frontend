import React, { useContext, useState, useEffect } from 'react';
import './Menubar.css';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';

const Menubar = () => {
  const navigate = useNavigate();
  const { setAuthData } = useContext(AppContext);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email') || '';
    const name = email.split('@')[0] || 'User';
    setUserRole(role || '');
    setUserName(name);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    setAuthData(null, null);
    navigate('/login');
  };

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <a className="navbar-brand" href="#">
        <img
          src={assets.logo}
          alt="Logo"
          height="40"
        />
      </a>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse p-2" id="navbarNav">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link" to="/explore">
              <i className="bi bi-compass me-2"></i>
              Explore
            </Link>
          </li>

          {isLoggedIn && (
            <li className="nav-item">
              <Link className="nav-link" to="/order-history">
                <i className="bi bi-clock-history me-2"></i>
                Order History
              </Link>
            </li>
          )}

          {isLoggedIn && isAdmin && (
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                <i className="bi bi-shield-check me-2"></i>
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        <ul className="navbar-nav ms-auto">
          {isLoggedIn ? (
            <>
              <li className="nav-item d-flex align-items-center me-3">
                <span className="navbar-text text-white">
                  <i className="bi bi-person-circle me-2"></i>
                  {userName}
                </span>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={logout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link className="btn btn-primary btn-sm" to="/login">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Menubar
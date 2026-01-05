import React from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Menubar from './components/Menubar/Menubar'
import RoleIndicator from './components/RoleIndicator/RoleIndicator'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import Explore from './pages/Explore/Explore'
import ManageCategory from './pages/ManageCategory/ManageCategory'
import ManageItems from './pages/ManageItems/ManageItems'
import ManageUsers from './pages/ManageUsers/ManageUsers'
import Login from './pages/Login/Login'
import Register from './pages/Login/Register'
import OrderHistory from './pages/OrderHistory/OrderHistory';
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import PaymentCallback from './pages/PaymentCallback/PaymentCallback';

// Protected Route Component for Admin only
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';

  if (!token) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    toast.error('Access denied. Admin only.');
    return <Navigate to="/explore" replace />;
  }

  return children;
};

// Protected Route Component for any logged-in user
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const location = useLocation();

  return (
    <div>
      {location.pathname !== '/login' && location.pathname !== '/register' && <Menubar />}
      {location.pathname !== '/login' && location.pathname !== '/register' && (
        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          toastStyle={{
            fontSize: "0.9rem",
            borderRadius: "20px",
            padding: "10px 16px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            minWidth: "220px",
            maxWidth: "320px",
            background: "#ffe0b2",
            color: "#333",
            border: "1px solid #ffb74d",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          bodyStyle={{
            margin: 0,
            padding: 0,
            fontWeight: 500,
            lineHeight: "1.3",
          }}
          style={{
            zIndex: 9999,
            top: "1rem",
            width: "100%",
            maxWidth: "360px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "0 10px",
          }}
        />
      )}

      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin only routes */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/manage-category"
          element={
            <AdminRoute>
              <ManageCategory />
            </AdminRoute>
          }
        />
        <Route
          path="/manage-items"
          element={
            <AdminRoute>
              <ManageItems />
            </AdminRoute>
          }
        />
        <Route
          path="/manage-users"
          element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          }
        />

        {/* Public route - Explore is accessible to everyone */}
        <Route
          path="/explore"
          element={<Explore />}
        />

        {/* Protected route - Order History for logged-in users */}
        <Route
          path="/order-history"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />

        {/* Khalti return callback */}
        <Route path="/payment/callback" element={<PaymentCallback />} />

        {/* Default route - redirect based on login status and role */}
        <Route
          path="/"
          element={
            (() => {
              const token = localStorage.getItem('token');
              const role = localStorage.getItem('role');

              // If not logged in, redirect to register page
              if (!token) {
                return <Navigate to="/register" replace />;
              }

              // If logged in as admin, redirect to dashboard
              if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
                return <Navigate to="/dashboard" replace />;
              }

              // If logged in as regular user, redirect to explore
              return <Navigate to="/explore" replace />;
            })()
          }
        />
      </Routes>
    </div>
  )
}

export default App
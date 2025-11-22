import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Menubar from './components/Menubar/Menubar'
import RoleIndicator from './components/RoleIndicator/RoleIndicator'
import Dashboard from './pages/Dashboard/Dashboard'
import Explore from './pages/Explore/Explore'
import ManageCategory from './pages/ManageCategory/ManageCategory'
import ManageItems from './pages/ManageItems/ManageItems'
import ManageUsers from './pages/ManageUsers/ManageUsers'
import Login from './pages/Login/Login'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


const App = () => {
  const location = useLocation();
  
  return (
    <div>
      {location.pathname !== '/login' && <Menubar />}
      {location.pathname !== '/login' && (
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/manage-category" element={<ManageCategory />} />
        <Route path="/manage-items" element={<ManageItems />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  )
}

export default App
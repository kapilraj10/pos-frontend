import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "../../Service/AuthService";
import "./Login.css";
import loginBg from "../../assets/login-bg.jpg"; 

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(data);
      
      if (response.status === 200 || response.status === 201) {
        const token = response.data?.token || response.data?.accessToken || response.data;
        const role = response.data?.role || response.data?.userRole || response.data?.authorities?.[0] || 'USER';
        
        console.log("Login response:", response.data);
        console.log("Extracted token:", token);
        console.log("Extracted role:", role);
        
        if (!token) {
          toast.error("No token received from server");
          return;
        }
        
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        
        const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
        toast.success(`Login Successful! Welcome ${isAdmin ? 'Admin' : 'User'}`);
        
        // Redirect based on role
        if (isAdmin) {
          navigate("/dashboard");
        } else {
          navigate("/explore");
        }
        
        setData({ email: "", password: "" });
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle different error scenarios
      if (error?.response?.status === 403) {
        toast.error("Access forbidden. Please check your credentials and try again.");
      } else if (error?.response?.status === 401) {
        toast.error("Invalid email or password");
      } else if (error?.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message === "Network Error") {
        toast.error("Cannot connect to server. Please check if the backend is running.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-light d-flex align-items-center justify-content-center vh-100 login-background"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url(${loginBg})`,
      }}
      role="presentation"
      aria-label="Login background"
    >
      <div className="card shadow-lg w-100" style={{ maxWidth: 480 }}>
        <div className="card-body">
          <div className="text-center">
            <h1 className="card-title">Sign in</h1>
            <p className="card-text text-muted">Sign in to your account to continue</p>
          </div>

          <div className="mt-4">
            <form onSubmit={onSubmitHandler}>
              <div className="mb-4">
                <label htmlFor="email" className="form-label text-muted">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={data.email}
                  onChange={onChangeHandler}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label text-muted">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={data.password}
                  onChange={onChangeHandler}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
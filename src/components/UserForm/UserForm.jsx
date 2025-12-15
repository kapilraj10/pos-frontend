import React, { useState } from "react";
import { toast } from "react-toastify";
import { addUser } from "../../Service/UserService";

const UserForm = ({ setUsers }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ROLE_USER"
  });

  const onChangeHandler = (e) => {
    const value = e.target.value;
    const name = e.target.name;

    setData((data) => ({
      ...data,
      [name]: value
    }))
  }
  
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!data.name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (!data.email.trim()) {
      toast.error("Please enter an email");
      return;
    }
    if (!data.password.trim()) {
      toast.error("Please enter a password");
      return;
    }
    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    try {
      const response = await addUser(data);
      if (response.status === 200 || response.status === 201) {
        setUsers((prevUsers) => [...prevUsers, response.data]);
        toast.success("User created successfully!");
        setData({
          name: "",
          email: "",
          password: "",
          role: "ROLE_USER"
        });
      }
    } catch (error) {
      console.error("Error in saving user:", error);
      const errorMsg = error?.response?.data?.message || "Something went wrong. Please try again later.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="user-form-container">
      <div className="form-header">
        <h3 className="form-title">Create New User</h3>
        <p className="form-subtitle">Add a new user with credentials (Role: Regular User)</p>
      </div>

      <form onSubmit={onSubmitHandler} className="user-form">
        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Full Name
            <span className="required">*</span>
          </label>
          <div className="input-with-icon">
            <i className="bi bi-person icon-left"></i>
            <input
              type="text"
              name="name"
              id="name"
              className="form-input"
              placeholder="John Doe"
              value={data.name}
              onChange={onChangeHandler}
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
            <span className="required">*</span>
          </label>
          <div className="input-with-icon">
            <i className="bi bi-envelope icon-left"></i>
            <input
              type="email"
              name="email"
              id="email"
              className="form-input"
              placeholder="john@example.com"
              value={data.email}
              onChange={onChangeHandler}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
            <span className="required">*</span>
          </label>
          <div className="input-with-icon">
            <i className="bi bi-lock icon-left"></i>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              className="form-input"
              placeholder="••••••••"
              value={data.password}
              onChange={onChangeHandler}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide password" : "Show password"}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </button>
          </div>
          <p className="password-hint">Must be at least 6 characters long</p>
        </div>

        {/* Hidden Role Field - Default to ROLE_USER */}
        <input type="hidden" name="role" value={data.role} />

        {/* Submit Button */}
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Creating User...
            </>
          ) : (
            <>
              <i className="bi bi-person-plus"></i>
              Create User
            </>
          )}
        </button>
      </form>

      <style>{`
        .user-form-container {
          background: #0a0a0a;
          border: 1px solid #1f1f1f;
          border-radius: 8px;
          padding: 16px;
        }
        
        .form-header {
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid #1f1f1f;
        }
        
        .form-title {
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 2px 0;
        }
        
        .form-subtitle {
          color: #6b7280;
          font-size: 12px;
          margin: 0;
        }
        
        .user-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .form-label {
          color: #9ca3af;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
        }
        
        .required {
          color: #ef4444;
          margin-left: 3px;
        }
        
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .icon-left {
          position: absolute;
          left: 10px;
          color: #4b5563;
          font-size: 14px;
          pointer-events: none;
        }
        
        .form-input {
          background: #111111;
          border: 1px solid #222;
          border-radius: 6px;
          color: #ffffff;
          padding: 10px 10px 10px 34px;
          font-size: 13px;
          width: 100%;
          transition: border-color 0.2s;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .form-input::placeholder {
          color: #4b5563;
        }
        
        .toggle-password {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          color: #4b5563;
          cursor: pointer;
          font-size: 14px;
          padding: 2px;
          border-radius: 4px;
          transition: color 0.2s;
        }
        
        .toggle-password:hover {
          color: #9ca3af;
        }
        
        .password-hint {
          color: #4b5563;
          font-size: 11px;
          margin: 2px 0 0 0;
        }
        
        .submit-button {
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 6px;
        }
        
        .submit-button:hover:not(:disabled) {
          background: #5a6fd6;
        }
        
        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UserForm;
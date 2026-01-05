import React, { useState } from "react";
import { toast } from "react-toastify";
import { addUser } from "../../Service/UserService";
import "./UserForm.css";

const UserForm = ({ setUsers }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ROLE_USER",
  });

  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!data.name.trim()) return toast.error("Name required");
    if (!data.email.trim()) return toast.error("Email required");
    if (data.password.length < 6)
      return toast.error("Password must be 6+ characters");

    setLoading(true);
    try {
      const res = await addUser(data);
      if (res.status === 200 || res.status === 201) {
        setUsers((prev) => [...prev, res.data]);
        toast.success("User created successfully");
        setData({ name: "", email: "", password: "", role: "ROLE_USER" });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to create user"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-form">
      <div className="card shadow-sm border-0 w-100">
        <div className="card-body p-3 p-sm-4">

          {/* Header */}
          <div className="mb-4">
            <h5 className="fw-bold mb-1">Create New User</h5>
            <p className="text-muted small mb-0">
              Add a regular user to the system
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className="row g-3">

            {/* Name */}
            <div className="col-12">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="John Doe"
                value={data.name}
                onChange={onChangeHandler}
              />
            </div>

            {/* Email */}
            <div className="col-12">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="john@example.com"
                value={data.email}
                onChange={onChangeHandler}
              />
            </div>

            {/* Password */}
            <div className="col-12">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="******"
                value={data.password}
                onChange={onChangeHandler}
              />
              <small className="text-muted">
                Minimum 6 characters
              </small>
            </div>

            {/* Submit */}
            <div className="col-12">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus me-2 text-dark"></i>
                    Create User
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;

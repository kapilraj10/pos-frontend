import React, { useState } from "react";
import { toast } from "react-toastify";
import { addUser } from "../../Service/UserService";

const UserForm = ({ setUsers }) => {
  
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      const response = await addUser(data);
      if (response.status === 200 || response.status === 201) {
        setUsers((prevUsers) => [...prevUsers, response.data]);
        toast.success("User saved successfully");
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
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body p-4">
              <h4 className="text-center mb-4 fw-bold text-primary">User Form</h4>

              <form onSubmit={onSubmitHandler}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label fw-semibold">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="form-control form-control-lg"
                    placeholder="Kapil K.C."
                    value={data.name}
                    onChange={onChangeHandler}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="form-control form-control-lg"
                    placeholder="kapilmern.dev@gmail.com"
                    value={data.email}
                    onChange={onChangeHandler}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="form-control form-control-lg"
                    placeholder="********"
                    value={data.password}
                    onChange={onChangeHandler}
                  />
                </div>

                <button type="submit" className="btn btn-warning w-100 fw-semibold" disabled={loading}>
                  {loading ? "Saving..." : "Save User"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { requestOtp, verifyOtpAndRegister } from "../../Service/AuthService";
import "./Login.css";
import loginBg from "../../assets/login-bg.jpg";

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Email + Details, 2: OTP Verification
    const [data, setData] = useState({
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
        otp: "",
    });

    const onChangeHandler = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();

        // Validation for Phase 1
        if (!data.email || !data.name || !data.password || !data.confirmPassword) {
            toast.error("Please fill all fields");
            return;
        }

        if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (data.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const response = await requestOtp(data.email);

            if (response.status === 200) {
                toast.success("OTP sent to your email! Please check your inbox.");
                setStep(2);
            }
        } catch (error) {
            console.error("OTP request error:", error);

            if (error?.response?.status === 400) {
                toast.error(error.response.data.message || "User already exists");
            } else if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to send OTP. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        // Validation for Phase 2
        if (!data.otp) {
            toast.error("Please enter the OTP");
            return;
        }

        if (data.otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            const registerData = {
                name: data.name,
                email: data.email,
                password: data.password,
                otpCode: data.otp,  // Backend expects 'otpCode' not 'otp'
            };

            const response = await verifyOtpAndRegister(registerData);

            if (response.status === 200 || response.status === 201) {
                toast.success("Registration successful! Please login to continue.");
                // Redirect to login page
                navigate("/login");
            }
        } catch (error) {
            console.error("OTP verification error:", error);

            if (error?.response?.status === 400) {
                toast.error(error.response.data.message || "Invalid or expired OTP");
            } else if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("OTP verification failed. Please try again.");
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
            aria-label="Registration background"
        >
            <div className="card shadow-lg w-100" style={{ maxWidth: 480 }}>
                <div className="card-body">
                    <div className="text-center">
                        <h1 className="card-title">Create Account</h1>
                        <p className="card-text text-muted">
                            {step === 1 ? "Fill in your details to register" : "Verify your email"}
                        </p>
                    </div>

                    {step === 1 ? (
                        // Step 1: Email + Username + Password
                        <div className="mt-4">
                            <form onSubmit={handleRequestOtp}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label text-muted">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        placeholder="kapilrajkc10@gmail.com"
                                        value={data.email}
                                        onChange={onChangeHandler}
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label text-muted">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        placeholder="Kapil Raj "
                                        value={data.name}
                                        onChange={onChangeHandler}
                                        required
                                        autoComplete="name"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label text-muted">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        placeholder="At least 6 characters"
                                        value={data.password}
                                        onChange={onChangeHandler}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="form-label text-muted">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder="Re-enter your password"
                                        value={data.confirmPassword}
                                        onChange={onChangeHandler}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? "Sending OTP..." : "Send OTP"}
                                    </button>
                                </div>
                            </form>

                            <div className="text-center mt-3">
                                <p className="text-muted">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-primary text-decoration-none">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </div>
                    ) : (
                        // Step 2: OTP Verification Only
                        <div className="mt-4">
                            <form onSubmit={handleVerifyOtp}>
                                <div className="mb-4">
                                    <label htmlFor="otp" className="form-label text-muted">
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control text-center fw-bold"
                                        id="otp"
                                        name="otp"
                                        placeholder="000000"
                                        value={data.otp}
                                        onChange={onChangeHandler}
                                        maxLength="6"
                                        required
                                        autoComplete="off"
                                        style={{ letterSpacing: "0.5rem", fontSize: "1.5rem" }}
                                    />
                                    <small className="text-muted">
                                        Enter the 6-digit code sent to {data.email}
                                    </small>
                                </div>

                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? "Verifying..." : "Verify & Register"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setStep(1)}
                                        disabled={loading}
                                    >
                                        Back
                                    </button>
                                </div>
                            </form>

                            <div className="text-center mt-3">
                                <p className="text-muted">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-primary text-decoration-none">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;

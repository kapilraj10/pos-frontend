import React, { useState } from 'react';
import { requestOtp, verifyOtpAndRegister } from '../../Service/AuthService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [step, setStep] = useState(1); // 1 = email input, 2 = OTP and registration details
    const [form, setForm] = useState({ email: '', otp: '', name: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!form.email) return toast.error('Email is required');

        setLoading(true);
        try {
            const res = await requestOtp(form.email);
            if (res.status === 200 || res.status === 201) {
                toast.success('OTP sent to your email!');
                setStep(2);
            }
        } catch (err) {
            console.error('OTP request error', err);
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        if (!form.otp || !form.name || !form.password) {
            return toast.error('All fields are required');
        }

        setLoading(true);
        try {
            const payload = {
                email: form.email,
                otpCode: form.otp,
                name: form.name,
                password: form.password
            };
            const res = await verifyOtpAndRegister(payload);
            if (res.status === 201 || res.status === 200) {
                toast.success('Registration successful! Please login');
                navigate('/login');
            }
        } catch (err) {
            console.error('Registration error', err);
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100" style={{ background: 'linear-gradient(90deg,#eef2ff,#fff0f6)' }}>
            <div className="card shadow-lg" style={{ maxWidth: 480, width: '100%' }}>
                <div className="card-body">
                    <h3 className="card-title text-center mb-3">Create an account</h3>

                    {step === 1 ? (
                        /* Step 1: Email input and request OTP */
                        <form onSubmit={handleRequestOtp}>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={form.email}
                                    onChange={onChange}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        /* Step 2: OTP verification and registration details */
                        <form onSubmit={handleVerifyAndRegister}>
                            <div className="alert alert-info mb-3">
                                <small>OTP sent to <strong>{form.email}</strong></small>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Enter OTP</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="otp"
                                    value={form.otp}
                                    onChange={onChange}
                                    placeholder="6-digit code"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={form.name}
                                    onChange={onChange}
                                    placeholder="Your full name"
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    value={form.password}
                                    onChange={onChange}
                                    placeholder="Create a password"
                                    required
                                />
                            </div>

                            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify & Create Account'}
                            </button>

                            <button
                                className="btn btn-link w-100 mt-2"
                                type="button"
                                onClick={() => setStep(1)}
                                disabled={loading}
                            >
                                Change Email
                            </button>
                        </form>
                    )}

                    <div className="text-center mt-3">
                        <small>Already have an account? <a href="/login">Sign in</a></small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

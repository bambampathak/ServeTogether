import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const data = await login(formData.email, formData.password);
            toast.success('Login successful! Welcome back!');
            navigate(data.volunteer.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotEmail) {
            toast.error('Please enter your email address');
            return;
        }
        setLoading(true);
        try {
            const { authAPI } = await import('../services/api');
            await authAPI.forgotPassword({ email: forgotEmail });
            toast.success('Password reset email sent! Check your inbox.');
            setForgotMode(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container glass">
                <div className="auth-header">
                    <span className="auth-logo">🤝</span>
                    <h1>{forgotMode ? 'Reset Password' : 'Welcome Back'}</h1>
                    <p>{forgotMode ? 'Enter your email to receive a reset link' : 'Login to your ServeTogether account'}</p>
                </div>

                <form onSubmit={forgotMode ? handleForgotPassword : handleSubmit} className="auth-form">
                    {!forgotMode ? (
                        <>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <div className="input-with-icon">
                                    <FiMail className="input-icon" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-with-icon">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-row form-row-between">
                                <button type="button" className="link-btn" onClick={() => setForgotMode(true)}>
                                    Forgot Password?
                                </button>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'} <FiArrowRight />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label htmlFor="forgotEmail">Email Address</label>
                                <div className="input-with-icon">
                                    <FiMail className="input-icon" />
                                    <input
                                        type="email"
                                        id="forgotEmail"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="Enter your registered email"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'} <FiArrowRight />
                            </button>

                            <button type="button" className="link-btn center" onClick={() => setForgotMode(false)}>
                                Back to Login
                            </button>
                        </>
                    )}
                </form>

                {!forgotMode && (
                    <div className="auth-footer">
                        <p>Don't have an account? <Link to="/signup">Sign Up as Volunteer</Link></p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;

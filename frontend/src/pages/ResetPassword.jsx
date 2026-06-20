import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.newPassword || !formData.confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }
        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authAPI.resetPassword(token, { password: formData.newPassword });
            setSuccess(true);
            toast.success('Password reset successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password. The token may be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container glass">
                {success ? (
                    <div className="reset-success">
                        <FiCheckCircle size={64} className="success-icon" />
                        <h1>Password Reset Successful!</h1>
                        <p>Your password has been updated. You can now log in with your new password.</p>
                        <Link to="/login" className="btn btn-primary btn-lg">
                            Go to Login <FiArrowRight />
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="auth-header">
                            <span className="auth-logo">🤝</span>
                            <h1>Reset Your Password</h1>
                            <p>Enter your new password below</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <div className="input-with-icon">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="newPassword"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        placeholder="Min 6 characters"
                                        required
                                    />
                                    <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <div className="input-with-icon">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter new password"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'} <FiArrowRight />
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Remember your password? <Link to="/login">Login here</Link></p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiActivity } from 'react-icons/fi';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="logo">
                    ServeTogether
                </Link>

                <div className="nav-links">
                    <Link to="/" className={`nav-link ${isActive('/')}`}>
                        Home
                    </Link>
                    {user ? (
                        <>
                            {user.role === 'admin' ? (
                                <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
                                    Admin Panel
                                </Link>
                            ) : (
                                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                                    Dashboard
                                </Link>
                            )}
                            <div className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                                <FiUser /> {user.name}
                            </div>
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                                <FiLogOut /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={`nav-link ${isActive('/login')}`}>
                                Login
                            </Link>
                            <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                                Join as Volunteer
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

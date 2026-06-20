import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationAPI } from '../services/api';
import { FiMenu, FiX, FiBell, FiUser, FiLogOut, FiChevronDown, FiHome, FiCalendar, FiAward, FiFileText, FiSettings, FiUsers, FiBarChart2, FiClock, FiSun, FiMoon } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdown, setProfileDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notifDropdown, setNotifDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            fetchNotifications();
        }
    }, [user]);

    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileDropdown(false);
        setNotifDropdown(false);
    }, [location]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileDropdown(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const res = await notificationAPI.getUnreadCount();
            setUnreadCount(res.data.count);
        } catch (err) {
            // silently fail
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await notificationAPI.getAll({ limit: 5 });
            setNotifications(res.data.notifications || res.data);
        } catch (err) {
            // silently fail
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationAPI.markRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => prev - 1);
        } catch (err) {
            toast.error('Failed to mark notification as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (err) {
            toast.error('Failed to mark all notifications as read');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        toast.success('Logged out successfully');
    };

    const volunteerLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
        { path: '/events', label: 'Events', icon: <FiCalendar /> },
        { path: '/leaderboard', label: 'Leaderboard', icon: <FiAward /> },
        { path: '/certificates', label: 'Certificates', icon: <FiFileText /> },
    ];

    const adminLinks = [
        { path: '/admin', label: 'Dashboard', icon: <FiHome /> },
        { path: '/admin/events', label: 'Events', icon: <FiCalendar /> },
        { path: '/admin/volunteers', label: 'Volunteers', icon: <FiUsers /> },
        { path: '/admin/attendance', label: 'Attendance', icon: <FiClock /> },
        { path: '/admin/reports', label: 'Reports', icon: <FiBarChart2 /> },
    ];

    const navLinks = user?.role === 'admin' ? adminLinks : volunteerLinks;

    return (
        <nav className="navbar glass">
            <div className="navbar-container">
                <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'} className="navbar-brand">
                    <span className="brand-icon">🤝</span>
                    <span className="brand-text">ServeTogether</span>
                    <span className="brand-subtitle">Nayepankh Foundation</span>
                </Link>

                {user && (
                    <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="navbar-actions">
                    <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                        {isDark ? <FiSun /> : <FiMoon />}
                    </button>

                    {user ? (
                        <>
                            <div className="notif-wrapper" ref={notifRef}>
                                <button
                                    className="notif-btn"
                                    onClick={() => setNotifDropdown(!notifDropdown)}
                                    title="Notifications"
                                >
                                    <FiBell />
                                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                                </button>
                                {notifDropdown && (
                                    <div className="notif-dropdown">
                                        <div className="notif-header">
                                            <h4>Notifications</h4>
                                            {unreadCount > 0 && (
                                                <button onClick={handleMarkAllRead} className="mark-all-btn">
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="notif-list">
                                            {notifications.length === 0 ? (
                                                <p className="notif-empty">No notifications</p>
                                            ) : (
                                                notifications.map(n => (
                                                    <div
                                                        key={n._id}
                                                        className={`notif-item ${n.isRead ? '' : 'unread'}`}
                                                        onClick={() => {
                                                            if (!n.isRead) handleMarkRead(n._id);
                                                            if (n.actionUrl) navigate(n.actionUrl);
                                                            setNotifDropdown(false);
                                                        }}
                                                    >
                                                        <div className="notif-item-content">
                                                            <strong>{n.title}</strong>
                                                            <p>{n.message}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="profile-wrapper" ref={profileRef}>
                                <button
                                    className="profile-btn"
                                    onClick={() => setProfileDropdown(!profileDropdown)}
                                >
                                    <div className="profile-avatar-small">
                                        {user.photo ? (
                                            <img src={user.photo} alt={user.name} />
                                        ) : (
                                            <FiUser />
                                        )}
                                    </div>
                                    <span className="profile-name">{user.name?.split(' ')[0]}</span>
                                    <FiChevronDown />
                                </button>
                                {profileDropdown && (
                                    <div className="profile-dropdown">
                                        <div className="profile-dropdown-header">
                                            <div className="profile-avatar">
                                                {user.photo ? (
                                                    <img src={user.photo} alt={user.name} />
                                                ) : (
                                                    <FiUser />
                                                )}
                                            </div>
                                            <div>
                                                <strong>{user.name}</strong>
                                                <p>{user.email}</p>
                                                <span className={`badge badge-${user.role}`}>{user.role}</span>
                                            </div>
                                        </div>
                                        <div className="profile-dropdown-links">
                                            <Link to="/profile" onClick={() => setProfileDropdown(false)}>
                                                <FiUser /> My Profile
                                            </Link>
                                            <button onClick={handleLogout}>
                                                <FiLogOut /> Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="navbar-auth-btns">
                            <Link to="/login" className="btn btn-outline">Login</Link>
                            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                        </div>
                    )}

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

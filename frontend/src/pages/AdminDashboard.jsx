import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { adminAPI, eventAPI } from '../services/api';
import { FiUsers, FiCalendar, FiClock, FiAward, FiCheckCircle, FiXCircle, FiArrowRight, FiStar, FiTrendingUp, FiAlertCircle, FiFileText, FiBarChart2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

function AdminDashboard() {
    const scrollRef = useScrollAnimation();
    const [dashboardData, setDashboardData] = useState(null);
    const [pendingVolunteers, setPendingVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getDashboard();
            setDashboardData(res.data);
        } catch (err) {
            toast.error('Failed to load admin dashboard');
        }
        try {
            const res = await adminAPI.getPendingVolunteers();
            setPendingVolunteers(res.data.volunteers || res.data || []);
        } catch (err) {
            // silently fail
        }
        setLoading(false);
    };

    const handleApprove = async (id) => {
        try {
            await adminAPI.approveVolunteer(id);
            toast.success('Volunteer approved successfully');
            setPendingVolunteers(pendingVolunteers.filter(v => v._id !== id));
            fetchDashboard();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve volunteer');
        }
    };

    const handleReject = async (id) => {
        try {
            await adminAPI.rejectVolunteer(id, { reason: 'Not meeting requirements' });
            toast.success('Volunteer rejected');
            setPendingVolunteers(pendingVolunteers.filter(v => v._id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject volunteer');
        }
    };

    if (loading) {
        return <div className="loading-screen">Loading admin dashboard...</div>;
    }

    const stats = dashboardData?.stats || {};
    const distributions = dashboardData?.distributions || {};

    return (
        <div className="admin-dashboard-page" ref={scrollRef}>
            <div className="page-header scroll-animate">
                <h1>Admin Dashboard</h1>
                <p>Nayepankh Foundation — ServeTogether Management</p>
            </div>

            {/* Main Stats */}
            <div className="stats-grid">
                <div className="stat-card glass scroll-animate delay-1">
                    <div className="stat-icon"><FiUsers /></div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.totalVolunteers || 0}</span>
                        <span className="stat-label">Total Volunteers</span>
                    </div>
                    <div className="stat-detail">{stats.activeVolunteers || 0} active</div>
                </div>
                <div className="stat-card glass scroll-animate delay-2">
                    <div className="stat-icon"><FiCalendar /></div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.totalEvents || 0}</span>
                        <span className="stat-label">Total Events</span>
                    </div>
                    <div className="stat-detail">{stats.upcomingEvents || 0} upcoming</div>
                </div>
                <div className="stat-card glass scroll-animate delay-3">
                    <div className="stat-icon"><FiClock /></div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.totalHours || 0}</span>
                        <span className="stat-label">Total Hours</span>
                    </div>
                </div>
                <div className="stat-card glass scroll-animate delay-4">
                    <div className="stat-icon"><FiAlertCircle /></div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.pendingVolunteers || pendingVolunteers.length}</span>
                        <span className="stat-label">Pending Approvals</span>
                    </div>
                    <div className="stat-detail urgent">Needs attention</div>
                </div>
            </div>

            {/* Pending Approvals */}
            {pendingVolunteers.length > 0 && (
                <div className="admin-section">
                    <div className="section-header">
                        <h2><FiAlertCircle /> Pending Volunteer Approvals</h2>
                        <Link to="/admin/volunteers" className="link-btn">View All <FiArrowRight /></Link>
                    </div>
                    <div className="pending-list">
                        {pendingVolunteers.map(vol => (
                            <div key={vol._id} className="pending-card glass scroll-animate delay-2">
                                <div className="pending-avatar">
                                    {vol.photo ? <img src={vol.photo} alt={vol.name} /> : <span>{vol.name?.charAt(0)}</span>}
                                </div>
                                <div className="pending-info">
                                    <h4>{vol.name}</h4>
                                    <p>{vol.email} • {vol.city || 'N/A'} • {vol.age || 'N/A'} years</p>
                                    <div className="pending-skills">
                                        {vol.skills?.slice(0, 3).map(s => <span key={s} className="skill-tag small">{s}</span>)}
                                    </div>
                                </div>
                                <div className="pending-actions">
                                    <button className="btn btn-primary btn-sm" onClick={() => handleApprove(vol._id)}>
                                        <FiCheckCircle /> Approve
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(vol._id)}>
                                        <FiXCircle /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Distribution Charts (simplified as bars) */}
            <div className="admin-grid">
                <div className="admin-section">
                    <h3><FiBarChart2 /> Gender Distribution</h3>
                    {distributions.genderDistribution?.length > 0 ? (
                        <div className="distribution-bars">
                            {distributions.genderDistribution.map(item => (
                                <div key={item._id} className="dist-bar-item">
                                    <span className="dist-label">{item._id}</span>
                                    <div className="dist-bar">
                                        <div className="dist-bar-fill" style={{ width: `${(item.count / stats.totalVolunteers) * 100}%` }}></div>
                                    </div>
                                    <span className="dist-count">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No data available</p>
                    )}
                </div>

                <div className="admin-section">
                    <h3><FiBarChart2 /> Skills Distribution</h3>
                    {distributions.skillsDistribution?.length > 0 ? (
                        <div className="distribution-bars">
                            {distributions.skillsDistribution.slice(0, 8).map(item => (
                                <div key={item._id} className="dist-bar-item">
                                    <span className="dist-label">{item._id}</span>
                                    <div className="dist-bar">
                                        <div className="dist-bar-fill" style={{ width: `${(item.count / stats.totalVolunteers) * 100}%` }}></div>
                                    </div>
                                    <span className="dist-count">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No data available</p>
                    )}
                </div>

                <div className="admin-section">
                    <h3><FiBarChart2 /> City Distribution</h3>
                    {distributions.cityDistribution?.length > 0 ? (
                        <div className="distribution-bars">
                            {distributions.cityDistribution.slice(0, 6).map(item => (
                                <div key={item._id} className="dist-bar-item">
                                    <span className="dist-label">{item._id || 'Unknown'}</span>
                                    <div className="dist-bar">
                                        <div className="dist-bar-fill" style={{ width: `${(item.count / stats.totalVolunteers) * 100}%` }}></div>
                                    </div>
                                    <span className="dist-count">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No data available</p>
                    )}
                </div>

                <div className="admin-section">
                    <h3><FiBarChart2 /> Age Distribution</h3>
                    {distributions.ageDistribution?.length > 0 ? (
                        <div className="distribution-bars">
                            {distributions.ageDistribution.map(item => (
                                <div key={item._id} className="dist-bar-item">
                                    <span className="dist-label">{item._id}</span>
                                    <div className="dist-bar">
                                        <div className="dist-bar-fill" style={{ width: `${(item.count / stats.totalVolunteers) * 100}%` }}></div>
                                    </div>
                                    <span className="dist-count">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No data available</p>
                    )}
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="admin-quick-links">
                <Link to="/admin/events" className="admin-quick-link glass scroll-animate delay-1">
                    <FiCalendar /> Manage Events
                </Link>
                <Link to="/admin/volunteers" className="admin-quick-link glass scroll-animate delay-2">
                    <FiUsers /> Manage Volunteers
                </Link>
                <Link to="/admin/attendance" className="admin-quick-link glass scroll-animate delay-3">
                    <FiClock /> Attendance
                </Link>
                <Link to="/admin/reports" className="admin-quick-link glass scroll-animate delay-4">
                    <FiBarChart2 /> Reports & Export
                </Link>
            </div>
        </div>
    );
}

export default AdminDashboard;

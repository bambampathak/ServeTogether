import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { eventAPI, attendanceAPI, certificateAPI, volunteerAPI } from '../services/api';
import { FiCalendar, FiClock, FiAward, FiFileText, FiArrowRight, FiCheckCircle, FiStar, FiTrendingUp, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';

function VolunteerDashboard() {
    const { user } = useAuth();
    const scrollRef = useScrollAnimation();
    const [stats, setStats] = useState({ totalHours: 0, totalEvents: 0, certificates: 0, points: 0 });
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [eventsRes, attendanceRes, certRes] = await Promise.all([
                eventAPI.getUpcoming(),
                attendanceAPI.getMyAttendance(),
                certificateAPI.getMyCertificates()
            ]);

            setUpcomingEvents(eventsRes.data.events || eventsRes.data || []);

            const attendanceData = attendanceRes.data.attendance || attendanceRes.data || [];
            setRecentAttendance(attendanceData.slice(0, 5));

            const certData = certRes.data.certificates || certRes.data || [];

            setStats({
                totalHours: user?.totalHours || attendanceData.reduce((sum, a) => sum + (a.hoursVolunteered || 0), 0),
                totalEvents: user?.totalEvents || attendanceData.length,
                certificates: certData.length,
                points: user?.points || 0
            });

            setBadges(user?.badges || []);
        } catch (err) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-screen">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard-page" ref={scrollRef}>
            <div className="page-header scroll-animate">
                <div className="page-header-content">
                    <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p>Here's your volunteer activity overview</p>
                </div>
                <div className="page-header-actions">
                    <Link to="/events" className="btn btn-primary">
                        <FiCalendar /> Browse Events
                    </Link>
                </div>
            </div>

            {/* Status Banner */}
            {user?.status === 'pending' && (
                <div className="status-banner pending">
                    <FiClock />
                    <p>Your registration is pending approval. You'll be notified once an admin reviews your application.</p>
                </div>
            )}
            {user?.status === 'rejected' && (
                <div className="status-banner rejected">
                    <FiCheckCircle />
                    <p>Your registration was not approved. Please contact the admin for more information.</p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card glass scroll-animate delay-1">
                    <div className="stat-icon"><FiClock /></div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.totalHours}</span>
                        <span className="stat-label">Total Hours</span>
                    </div>
                </div>
                <div className="stat-card glass scroll-animate delay-2">
                    <div className="stat-icon"><FiCalendar /></div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.totalEvents}</span>
                        <span className="stat-label">Events Attended</span>
                    </div>
                </div>
                <div className="stat-card glass scroll-animate delay-3">
                    <div className="stat-icon"><FiStar /></div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.points}</span>
                        <span className="stat-label">Points Earned</span>
                    </div>
                </div>
                <div className="stat-card glass scroll-animate delay-4">
                    <div className="stat-icon"><FiFileText /></div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.certificates}</span>
                        <span className="stat-label">Certificates</span>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            {badges.length > 0 && (
                <div className="badges-section">
                    <h3>Your Badges</h3>
                    <div className="badges-grid">
                        {badges.map(badge => (
                            <div key={badge} className="badge-card glass scroll-animate delay-2">
                                <span className="badge-icon">🏆</span>
                                <span className="badge-name">{badge}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="dashboard-grid">
                {/* Upcoming Events */}
                <div className="dashboard-card glass scroll-animate">
                    <div className="card-header">
                        <h3><FiCalendar /> Upcoming Events</h3>
                        <Link to="/events" className="link-btn">View All <FiArrowRight /></Link>
                    </div>
                    <div className="card-body">
                        {upcomingEvents.length === 0 ? (
                            <div className="empty-state small">
                                <FiCalendar />
                                <p>No upcoming events</p>
                                <Link to="/events" className="btn btn-outline btn-sm">Browse Events</Link>
                            </div>
                        ) : (
                            <div className="event-list">
                                {upcomingEvents.slice(0, 4).map(event => (
                                    <Link key={event._id} to={`/events/${event._id}`} className="event-list-item">
                                        <div className="event-list-date">
                                            <span className="event-day">{new Date(event.date).getDate()}</span>
                                            <span className="event-month">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                        <div className="event-list-info">
                                            <h4>{event.title}</h4>
                                            <p>{event.location?.city || event.location?.address || 'Location TBD'}</p>
                                            <span className="badge badge-category">{event.category}</span>
                                        </div>
                                        <FiArrowRight className="event-list-arrow" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Attendance */}
                <div className="dashboard-card glass scroll-animate delay-2">
                    <div className="card-header">
                        <h3><FiClock /> Recent Activity</h3>
                    </div>
                    <div className="card-body">
                        {recentAttendance.length === 0 ? (
                            <div className="empty-state small">
                                <FiTrendingUp />
                                <p>No recent activity</p>
                            </div>
                        ) : (
                            <div className="activity-list">
                                {recentAttendance.map(att => (
                                    <div key={att._id} className="activity-item">
                                        <div className="activity-icon">
                                            <FiCheckCircle />
                                        </div>
                                        <div className="activity-info">
                                            <h4>{att.event?.title || 'Event'}</h4>
                                            <p>{att.hoursVolunteered} hours • {att.checkInMethod} check-in</p>
                                        </div>
                                        <span className={`badge badge-${att.status}`}>{att.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="quick-links">
                <Link to="/profile" className="quick-link-card glass scroll-animate delay-1">
                    <FiUsers />
                    <span>My Profile</span>
                </Link>
                <Link to="/leaderboard" className="quick-link-card glass scroll-animate delay-2">
                    <FiAward />
                    <span>Leaderboard</span>
                </Link>
                <Link to="/certificates" className="quick-link-card glass scroll-animate delay-3">
                    <FiFileText />
                    <span>Certificates</span>
                </Link>
                <Link to="/events" className="quick-link-card glass scroll-animate delay-4">
                    <FiCalendar />
                    <span>All Events</span>
                </Link>
            </div>
        </div>
    );
}

export default VolunteerDashboard;

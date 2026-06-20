import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { adminAPI, eventAPI, volunteerAPI } from '../services/api';
import { FiBarChart2, FiDownload, FiCalendar, FiUsers, FiClock, FiFilter, FiTrendingUp, FiStar, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';

function AdminReports() {
    const scrollRef = useScrollAnimation();
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [reportType, setReportType] = useState('overview');

    useEffect(() => {
        fetchReports();
    }, [reportType, dateRange]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const params = { type: reportType, ...dateRange };
            const res = await adminAPI.getReports(params);
            setReports(res.data);
        } catch (err) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleExportVolunteers = async () => {
        try {
            const res = await adminAPI.exportVolunteers(dateRange);
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `volunteers-export-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('Volunteers CSV exported');
        } catch (err) {
            toast.error('Failed to export volunteers');
        }
    };

    const handleExportEvents = async () => {
        try {
            const res = await adminAPI.exportEvents(dateRange);
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `events-export-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('Events CSV exported');
        } catch (err) {
            toast.error('Failed to export events');
        }
    };

    const handleExportAttendance = async () => {
        try {
            const res = await adminAPI.exportAttendance(dateRange);
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `attendance-export-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('Attendance CSV exported');
        } catch (err) {
            toast.error('Failed to export attendance');
        }
    };

    return (
        <div className="admin-reports-page" ref={scrollRef}>
            <div className="page-header scroll-animate">
                <h1><FiBarChart2 /> Reports & Export</h1>
                <p>View analytics and export data for Nayepankh Foundation</p>
            </div>

            {/* Report Type Selector */}
            <div className="report-type-selector">
                <button className={`report-type-btn ${reportType === 'overview' ? 'active' : ''}`} onClick={() => setReportType('overview')}>
                    <FiTrendingUp /> Overview
                </button>
                <button className={`report-type-btn ${reportType === 'volunteers' ? 'active' : ''}`} onClick={() => setReportType('volunteers')}>
                    <FiUsers /> Volunteers
                </button>
                <button className={`report-type-btn ${reportType === 'events' ? 'active' : ''}`} onClick={() => setReportType('events')}>
                    <FiCalendar /> Events
                </button>
                <button className={`report-type-btn ${reportType === 'attendance' ? 'active' : ''}`} onClick={() => setReportType('attendance')}>
                    <FiClock /> Attendance
                </button>
            </div>

            {/* Date Range Filter */}
            <div className="date-range-filter">
                <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>End Date</label>
                    <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} />
                </div>
                <button className="btn btn-outline" onClick={() => setDateRange({ startDate: '', endDate: '' })}>Clear Dates</button>
            </div>

            {/* Export Buttons */}
            <div className="export-section">
                <h3><FiDownload /> Export Data</h3>
                <div className="export-buttons">
                    <button className="btn btn-outline" onClick={handleExportVolunteers}>
                        <FiUsers /> Export Volunteers CSV
                    </button>
                    <button className="btn btn-outline" onClick={handleExportEvents}>
                        <FiCalendar /> Export Events CSV
                    </button>
                    <button className="btn btn-outline" onClick={handleExportAttendance}>
                        <FiClock /> Export Attendance CSV
                    </button>
                </div>
            </div>

            {/* Report Content */}
            {loading ? (
                <div className="loading-screen">Loading reports...</div>
            ) : !reports ? (
                <div className="empty-state">
                    <FiBarChart2 size={64} />
                    <h3>No Report Data Available</h3>
                    <p>Reports will be available once there is activity data in the system.</p>
                </div>
            ) : (
                <div className="reports-content">
                    {/* Overview Stats */}
                    <div className="stats-grid">
                        <div className="stat-card glass scroll-animate delay-1">
                            <div className="stat-icon"><FiUsers /></div>
                            <div className="stat-info">
                                <span className="stat-number">{reports.totalVolunteers || reports.stats?.totalVolunteers || 0}</span>
                                <span className="stat-label">Total Volunteers</span>
                            </div>
                        </div>
                        <div className="stat-card glass scroll-animate delay-2">
                            <div className="stat-icon"><FiCalendar /></div>
                            <div className="stat-info">
                                <span className="stat-number">{reports.totalEvents || reports.stats?.totalEvents || 0}</span>
                                <span className="stat-label">Total Events</span>
                            </div>
                        </div>
                        <div className="stat-card glass scroll-animate delay-3">
                            <div className="stat-icon"><FiClock /></div>
                            <div className="stat-info">
                                <span className="stat-number">{reports.totalHours || reports.stats?.totalHours || 0}</span>
                                <span className="stat-label">Total Hours</span>
                            </div>
                        </div>
                        <div className="stat-card glass scroll-animate delay-4">
                            <div className="stat-icon"><FiStar /></div>
                            <div className="stat-info">
                                <span className="stat-number">{reports.totalPoints || reports.stats?.totalPoints || 0}</span>
                                <span className="stat-label">Total Points</span>
                            </div>
                        </div>
                    </div>

                    {/* Volunteer Report Details */}
                    {reportType === 'volunteers' && reports.volunteerStats && (
                        <div className="report-details">
                            <h3>Volunteer Statistics</h3>
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Status</th>
                                            <th>Count</th>
                                            <th>Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.volunteerStats.statusBreakdown?.map(item => (
                                            <tr key={item.status}>
                                                <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                                                <td>{item.count}</td>
                                                <td>{item.percentage}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {reports.volunteerStats.topVolunteers && (
                                <div className="top-volunteers-report">
                                    <h4>Top Volunteers by Hours</h4>
                                    <div className="admin-table-wrapper">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Hours</th>
                                                    <th>Events</th>
                                                    <th>Points</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reports.volunteerStats.topVolunteers.map(vol => (
                                                    <tr key={vol._id}>
                                                        <td>{vol.name}</td>
                                                        <td>{vol.totalHours}</td>
                                                        <td>{vol.totalEvents}</td>
                                                        <td>{vol.points}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Events Report Details */}
                    {reportType === 'events' && reports.eventStats && (
                        <div className="report-details">
                            <h3>Event Statistics</h3>
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Count</th>
                                            <th>Avg Volunteers</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.eventStats.categoryBreakdown?.map(item => (
                                            <tr key={item.category}>
                                                <td>{item.category}</td>
                                                <td>{item.count}</td>
                                                <td>{item.avgVolunteers || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {reports.eventStats.topEvents && (
                                <div className="top-events-report">
                                    <h4>Most Popular Events</h4>
                                    <div className="admin-table-wrapper">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Event</th>
                                                    <th>Date</th>
                                                    <th>Volunteers</th>
                                                    <th>Category</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reports.eventStats.topEvents.map(ev => (
                                                    <tr key={ev._id}>
                                                        <td>{ev.title}</td>
                                                        <td>{new Date(ev.date).toLocaleDateString('en-IN')}</td>
                                                        <td>{ev.currentVolunteers}</td>
                                                        <td>{ev.category}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Attendance Report Details */}
                    {reportType === 'attendance' && reports.attendanceStats && (
                        <div className="report-details">
                            <h3>Attendance Statistics</h3>
                            <div className="stats-grid">
                                <div className="stat-card glass scroll-animate delay-1">
                                    <div className="stat-info">
                                        <span className="stat-number">{reports.attendanceStats.totalCheckIns || 0}</span>
                                        <span className="stat-label">Total Check-ins</span>
                                    </div>
                                </div>
                                <div className="stat-card glass scroll-animate delay-2">
                                    <div className="stat-info">
                                        <span className="stat-number">{reports.attendanceStats.totalHours || 0}</span>
                                        <span className="stat-label">Total Hours</span>
                                    </div>
                                </div>
                                <div className="stat-card glass scroll-animate delay-3">
                                    <div className="stat-info">
                                        <span className="stat-number">{reports.attendanceStats.avgHoursPerEvent || 0}</span>
                                        <span className="stat-label">Avg Hours/Event</span>
                                    </div>
                                </div>
                            </div>

                            {reports.attendanceStats.methodBreakdown && (
                                <div className="method-breakdown">
                                    <h4>Check-in Methods</h4>
                                    <div className="distribution-bars">
                                        {reports.attendanceStats.methodBreakdown.map(item => (
                                            <div key={item.method} className="dist-bar-item">
                                                <span className="dist-label">{item.method}</span>
                                                <div className="dist-bar">
                                                    <div className="dist-bar-fill" style={{ width: `${item.percentage}%` }}></div>
                                                </div>
                                                <span className="dist-count">{item.count} ({item.percentage}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminReports;

import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { attendanceAPI, eventAPI, adminAPI } from '../services/api';
import { FiClock, FiCheckCircle, FiSearch, FiFilter, FiDownload, FiCalendar, FiUsers, FiX, FiUserCheck, FiUserX } from 'react-icons/fi';
import toast from 'react-hot-toast';

function AdminAttendance() {
    const scrollRef = useScrollAnimation();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', status: '', method: '' });
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [checkInData, setCheckInData] = useState({ volunteerId: '', eventId: '', method: 'manual' });
    const [showCheckOutModal, setShowCheckOutModal] = useState(false);
    const [checkOutData, setCheckOutData] = useState({ volunteerId: '', eventId: '' });

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            fetchAttendance();
        }
    }, [selectedEvent, filters]);

    const fetchEvents = async () => {
        try {
            const res = await eventAPI.getAll({ limit: 100 });
            setEvents(res.data.events || res.data || []);
        } catch (err) {
            toast.error('Failed to load events');
        }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await attendanceAPI.getEventAttendance(selectedEvent);
            let records = res.data.attendance || res.data || [];
            if (filters.search) {
                records = records.filter(r =>
                    r.volunteer?.name?.toLowerCase().includes(filters.search.toLowerCase())
                );
            }
            if (filters.status) {
                records = records.filter(r => r.status === filters.status);
            }
            if (filters.method) {
                records = records.filter(r => r.checkInMethod === filters.method);
            }
            setAttendanceRecords(records);
        } catch (err) {
            toast.error('Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminCheckIn = async (e) => {
        e.preventDefault();
        try {
            await attendanceAPI.adminCheckIn({
                volunteerId: checkInData.volunteerId,
                eventId: checkInData.eventId || selectedEvent,
                method: checkInData.method
            });
            toast.success('Volunteer checked in successfully');
            setShowCheckInModal(false);
            if (selectedEvent) fetchAttendance();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to check in volunteer');
        }
    };

    const handleAdminCheckOut = async (e) => {
        e.preventDefault();
        try {
            await attendanceAPI.adminCheckOut({
                volunteerId: checkOutData.volunteerId,
                eventId: checkOutData.eventId || selectedEvent
            });
            toast.success('Volunteer checked out successfully');
            setShowCheckOutModal(false);
            if (selectedEvent) fetchAttendance();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to check out volunteer');
        }
    };

    const handleExport = async () => {
        try {
            const res = await adminAPI.exportAttendance({ eventId: selectedEvent });
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

    const openCheckInModal = () => {
        setCheckInData({ volunteerId: '', eventId: selectedEvent, method: 'manual' });
        setShowCheckInModal(true);
    };

    const openCheckOutModal = () => {
        setCheckOutData({ volunteerId: '', eventId: selectedEvent });
        setShowCheckOutModal(true);
    };

    const totalHours = attendanceRecords.reduce((sum, r) => sum + (r.hoursVolunteered || 0), 0);
    const checkedIn = attendanceRecords.filter(r => r.checkInTime && !r.checkOutTime).length;
    const completed = attendanceRecords.filter(r => r.checkInTime && r.checkOutTime).length;

    return (
        <div className="admin-attendance-page" ref={scrollRef}>
            <div className="page-header scroll-animate">
                <h1><FiClock /> Attendance Management</h1>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={openCheckInModal}>
                        <FiUserCheck /> Manual Check In
                    </button>
                    <button className="btn btn-outline" onClick={openCheckOutModal}>
                        <FiUserX /> Manual Check Out
                    </button>
                    <button className="btn btn-outline" onClick={handleExport}>
                        <FiDownload /> Export CSV
                    </button>
                </div>
            </div>

            {/* Event Selector */}
            <div className="event-selector">
                <div className="form-group">
                    <label>Select Event</label>
                    <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
                        <option value="">Choose an event to view attendance</option>
                        {events.map(event => (
                            <option key={event._id} value={event._id}>
                                {event.title} — {new Date(event.date).toLocaleDateString('en-IN')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats */}
            {selectedEvent && (
                <div className="stats-grid">
                    <div className="stat-card glass scroll-animate delay-1">
                        <div className="stat-icon"><FiUsers /></div>
                        <div className="stat-info">
                            <span className="stat-number">{attendanceRecords.length}</span>
                            <span className="stat-label">Total Records</span>
                        </div>
                    </div>
                    <div className="stat-card glass scroll-animate delay-2">
                        <div className="stat-icon"><FiCheckCircle /></div>
                        <div className="stat-info">
                            <span className="stat-number">{checkedIn}</span>
                            <span className="stat-label">Currently Checked In</span>
                        </div>
                    </div>
                    <div className="stat-card glass scroll-animate delay-3">
                        <div className="stat-icon"><FiClock /></div>
                        <div className="stat-info">
                            <span className="stat-number">{totalHours}</span>
                            <span className="stat-label">Total Hours</span>
                        </div>
                    </div>
                    <div className="stat-card glass scroll-animate delay-4">
                        <div className="stat-icon"><FiCalendar /></div>
                        <div className="stat-info">
                            <span className="stat-number">{completed}</span>
                            <span className="stat-label">Completed</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            {selectedEvent && (
                <div className="search-filter-bar">
                    <div className="search-input-wrapper">
                        <FiSearch className="search-icon" />
                        <input type="text" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search volunteer name..." className="search-input" />
                    </div>
                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                        <option value="">All Status</option>
                        <option value="checked-in">Checked In</option>
                        <option value="checked-out">Checked Out</option>
                        <option value="completed">Completed</option>
                    </select>
                    <select value={filters.method} onChange={(e) => setFilters({ ...filters, method: e.target.value })}>
                        <option value="">All Methods</option>
                        <option value="qr">QR Code</option>
                        <option value="manual">Manual</option>
                        <option value="self">Self Check-in</option>
                    </select>
                </div>
            )}

            {/* Attendance Table */}
            {!selectedEvent ? (
                <div className="empty-state">
                    <FiCalendar size={64} />
                    <h3>Select an Event</h3>
                    <p>Choose an event from the dropdown above to view and manage attendance records.</p>
                </div>
            ) : loading ? (
                <div className="loading-screen">Loading attendance...</div>
            ) : attendanceRecords.length === 0 ? (
                <div className="empty-state">
                    <FiClock size={64} />
                    <h3>No Attendance Records</h3>
                    <p>No attendance records found for this event. Use the check-in button to manually check in volunteers.</p>
                </div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Volunteer</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Hours</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Verified By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceRecords.map(record => (
                                <tr key={record._id}>
                                    <td>
                                        <div className="table-vol-info">
                                            <div className="avatar-small">
                                                {record.volunteer?.photo ? (
                                                    <img src={record.volunteer.photo} alt={record.volunteer.name} />
                                                ) : (
                                                    <span>{record.volunteer?.name?.charAt(0) || '?'}</span>
                                                )}
                                            </div>
                                            <div>
                                                <strong>{record.volunteer?.name || 'Unknown'}</strong>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                    <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                    <td>{record.hoursVolunteered || '—'}</td>
                                    <td><span className="badge badge-method">{record.checkInMethod || 'N/A'}</span></td>
                                    <td><span className={`badge badge-${record.status}`}>{record.status}</span></td>
                                    <td>{record.verifiedBy?.name || 'Admin'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Check In Modal */}
            {showCheckInModal && (
                <div className="modal-overlay" onClick={() => setShowCheckInModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><FiUserCheck /> Manual Check In</h3>
                            <button onClick={() => setShowCheckInModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleAdminCheckIn} className="modal-body">
                            <div className="form-group">
                                <label>Event *</label>
                                <select name="eventId" value={checkInData.eventId} onChange={(e) => setCheckInData({ ...checkInData, eventId: e.target.value })} required>
                                    <option value="">Select Event</option>
                                    {events.map(event => (
                                        <option key={event._id} value={event._id}>{event.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Volunteer ID *</label>
                                <input type="text" value={checkInData.volunteerId} onChange={(e) => setCheckInData({ ...checkInData, volunteerId: e.target.value })} placeholder="Enter volunteer ID" required />
                            </div>
                            <div className="form-group">
                                <label>Check-in Method</label>
                                <select value={checkInData.method} onChange={(e) => setCheckInData({ ...checkInData, method: e.target.value })}>
                                    <option value="manual">Manual</option>
                                    <option value="qr">QR Code</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowCheckInModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary"><FiUserCheck /> Check In</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Check Out Modal */}
            {showCheckOutModal && (
                <div className="modal-overlay" onClick={() => setShowCheckOutModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><FiUserX /> Manual Check Out</h3>
                            <button onClick={() => setShowCheckOutModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleAdminCheckOut} className="modal-body">
                            <div className="form-group">
                                <label>Event *</label>
                                <select name="eventId" value={checkOutData.eventId} onChange={(e) => setCheckOutData({ ...checkOutData, eventId: e.target.value })} required>
                                    <option value="">Select Event</option>
                                    {events.map(event => (
                                        <option key={event._id} value={event._id}>{event.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Volunteer ID *</label>
                                <input type="text" value={checkOutData.volunteerId} onChange={(e) => setCheckOutData({ ...checkOutData, volunteerId: e.target.value })} placeholder="Enter volunteer ID" required />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowCheckOutModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary"><FiUserX /> Check Out</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminAttendance;

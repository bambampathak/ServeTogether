import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { adminAPI, volunteerAPI } from '../services/api';
import { FiUsers, FiSearch, FiFilter, FiCheckCircle, FiXCircle, FiTrash2, FiEye, FiDownload, FiMail, FiPhone, FiMapPin, FiStar, FiClock, FiCalendar, FiX, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

function AdminVolunteers() {
    const scrollRef = useScrollAnimation();
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', status: '', skills: '', city: '' });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchVolunteers();
    }, [pagination.page, filters]);

    const fetchVolunteers = async () => {
        setLoading(true);
        try {
            const params = { page: pagination.page, limit: pagination.limit, ...filters };
            const res = await volunteerAPI.getAll(params);
            const data = res.data;
            setVolunteers(data.volunteers || data);
            if (data.pagination) setPagination({ ...pagination, ...data.pagination });
        } catch (err) {
            toast.error('Failed to load volunteers');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPagination({ ...pagination, page: 1 });
    };

    const handleApprove = async (id) => {
        try {
            await adminAPI.approveVolunteer(id);
            toast.success('Volunteer approved successfully');
            fetchVolunteers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve volunteer');
        }
    };

    const handleReject = async (id) => {
        try {
            await adminAPI.rejectVolunteer(id, { reason: 'Not meeting requirements' });
            toast.success('Volunteer rejected');
            fetchVolunteers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject volunteer');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await adminAPI.updateVolunteerStatus(id, { status });
            toast.success(`Volunteer status updated to ${status}`);
            fetchVolunteers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this volunteer? This action cannot be undone.')) return;
        try {
            await adminAPI.deleteVolunteer(id);
            toast.success('Volunteer deleted');
            fetchVolunteers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete volunteer');
        }
    };

    const handleExport = async () => {
        try {
            const res = await adminAPI.exportVolunteers(filters);
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'volunteers-export.csv';
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('CSV exported successfully');
        } catch (err) {
            toast.error('Failed to export volunteers');
        }
    };

    const viewVolunteerDetail = (volunteer) => {
        setSelectedVolunteer(volunteer);
        setShowDetailModal(true);
    };

    return (
        <div className="admin-volunteers-page" ref={scrollRef}>
            <div className="page-header scroll-animate">
                <h1><FiUsers /> Volunteer Management</h1>
                <button className="btn btn-outline" onClick={handleExport}>
                    <FiDownload /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="search-filter-bar">
                <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search by name, email..." className="search-input" />
                </div>
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select name="skills" value={filters.skills} onChange={handleFilterChange}>
                    <option value="">All Skills</option>
                    <option value="Teaching">Teaching</option>
                    <option value="Medical">Medical</option>
                    <option value="Photography">Photography</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Event Management">Event Management</option>
                </select>
                <input type="text" name="city" value={filters.city} onChange={handleFilterChange} placeholder="Filter by city" className="filter-input" />
            </div>

            {/* Volunteers Table */}
            {loading ? (
                <div className="loading-screen">Loading volunteers...</div>
            ) : volunteers.length === 0 ? (
                <div className="empty-state">
                    <FiUsers size={64} />
                    <h3>No Volunteers Found</h3>
                    <p>Adjust your filters or wait for new registrations.</p>
                </div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Volunteer</th>
                                <th>Contact</th>
                                <th>Skills</th>
                                <th>City</th>
                                <th>Hours</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {volunteers.map(vol => (
                                <tr key={vol._id}>
                                    <td>
                                        <div className="table-vol-info">
                                            <div className="avatar-small">
                                                {vol.photo ? <img src={vol.photo} alt={vol.name} /> : <span>{vol.name?.charAt(0)}</span>}
                                            </div>
                                            <div>
                                                <strong>{vol.name}</strong>
                                                <p className="table-sub">{vol.age ? `${vol.age} yrs, ${vol.gender}` : ''}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="table-contact">
                                            <span><FiMail /> {vol.email}</span>
                                            <span><FiPhone /> {vol.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="table-skills">
                                            {vol.skills?.slice(0, 2).map(s => <span key={s} className="skill-tag small">{s}</span>)}
                                            {vol.skills?.length > 2 && <span className="more-skills">+{vol.skills.length - 2}</span>}
                                        </div>
                                    </td>
                                    <td>{vol.city || 'N/A'}</td>
                                    <td>
                                        <span className="table-hours"><FiClock /> {vol.totalHours || 0}h</span>
                                        <span className="table-events"><FiCalendar /> {vol.totalEvents || 0}e</span>
                                    </td>
                                    <td><span className={`badge badge-${vol.status}`}>{vol.status}</span></td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn btn-outline btn-sm" onClick={() => viewVolunteerDetail(vol)}><FiEye /></button>
                                            {vol.status === 'pending' && (
                                                <>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleApprove(vol._id)}><FiCheckCircle /></button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(vol._id)}><FiXCircle /></button>
                                                </>
                                            )}
                                            {vol.status === 'approved' && (
                                                <button className="btn btn-outline btn-sm" onClick={() => handleStatusUpdate(vol._id, 'active')}>Activate</button>
                                            )}
                                            {vol.status === 'active' && (
                                                <button className="btn btn-outline btn-sm" onClick={() => handleStatusUpdate(vol._id, 'inactive')}>Deactivate</button>
                                            )}
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(vol._id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="pagination">
                    <button className="pagination-btn" disabled={pagination.page === 1} onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}>Previous</button>
                    <span className="pagination-info">Page {pagination.page} of {pagination.pages}</span>
                    <button className="pagination-btn" disabled={pagination.page === pagination.pages} onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}>Next</button>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedVolunteer && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Volunteer Details</h3>
                            <button onClick={() => setShowDetailModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <div className="vol-detail-header">
                                <div className="avatar-large">
                                    {selectedVolunteer.photo ? <img src={selectedVolunteer.photo} alt={selectedVolunteer.name} /> : <span>{selectedVolunteer.name?.charAt(0)}</span>}
                                </div>
                                <div>
                                    <h2>{selectedVolunteer.name}</h2>
                                    <span className={`badge badge-${selectedVolunteer.status}`}>{selectedVolunteer.status}</span>
                                    <span className="badge badge-role">{selectedVolunteer.role}</span>
                                </div>
                            </div>

                            <div className="vol-detail-info">
                                <div className="detail-item"><FiMail /> <span>{selectedVolunteer.email}</span></div>
                                <div className="detail-item"><FiPhone /> <span>{selectedVolunteer.phone}</span></div>
                                <div className="detail-item"><FiMapPin /> <span>{selectedVolunteer.city || 'N/A'}</span></div>
                                <div className="detail-item"><FiStar /> <span>{selectedVolunteer.points || 0} points</span></div>
                                <div className="detail-item"><FiClock /> <span>{selectedVolunteer.totalHours || 0} hours</span></div>
                                <div className="detail-item"><FiCalendar /> <span>{selectedVolunteer.totalEvents || 0} events</span></div>
                            </div>

                            <div className="vol-detail-section">
                                <h4>Skills</h4>
                                <div className="skills-grid">
                                    {selectedVolunteer.skills?.map(s => <span key={s} className="skill-tag">{s}</span>)}
                                </div>
                            </div>

                            <div className="vol-detail-section">
                                <h4>Availability</h4>
                                <div className="availability-grid">
                                    {selectedVolunteer.availability?.weekdays && <span className="avail-tag">Weekdays</span>}
                                    {selectedVolunteer.availability?.weekends && <span className="avail-tag">Weekends</span>}
                                    {selectedVolunteer.availability?.morning && <span className="avail-tag">Morning</span>}
                                    {selectedVolunteer.availability?.afternoon && <span className="avail-tag">Afternoon</span>}
                                    {selectedVolunteer.availability?.evening && <span className="avail-tag">Evening</span>}
                                </div>
                            </div>

                            {selectedVolunteer.emergencyContact && (
                                <div className="vol-detail-section">
                                    <h4><FiAlertCircle /> Emergency Contact</h4>
                                    <p>Name: {selectedVolunteer.emergencyContact.name || 'N/A'}</p>
                                    <p>Phone: {selectedVolunteer.emergencyContact.phone || 'N/A'}</p>
                                    <p>Relation: {selectedVolunteer.emergencyContact.relation || 'N/A'}</p>
                                </div>
                            )}

                            {selectedVolunteer.badges?.length > 0 && (
                                <div className="vol-detail-section">
                                    <h4>Badges</h4>
                                    <div className="badges-grid">
                                        {selectedVolunteer.badges.map(b => <span key={b} className="badge-card">🏆 {b}</span>)}
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                {selectedVolunteer.status === 'pending' && (
                                    <>
                                        <button className="btn btn-primary" onClick={() => { handleApprove(selectedVolunteer._id); setShowDetailModal(false); }}>Approve</button>
                                        <button className="btn btn-danger" onClick={() => { handleReject(selectedVolunteer._id); setShowDetailModal(false); }}>Reject</button>
                                    </>
                                )}
                                <button className="btn btn-outline" onClick={() => setShowDetailModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminVolunteers;

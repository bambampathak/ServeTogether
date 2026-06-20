import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { eventAPI } from '../services/api';
import { FiCalendar, FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiX, FiSave, FiMapPin, FiClock, FiUsers, FiEye, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CATEGORIES = [
    'Education', 'Health', 'Environment', 'Social Service', 'Fundraising',
    'Community Development', 'Youth Empowerment', 'Women Empowerment', 'Disaster Relief', 'Other'
];

const SKILLS_OPTIONS = [
    'Teaching', 'Medical', 'First Aid', 'Counseling', 'Event Management',
    'Social Media', 'Photography', 'Writing', 'Graphic Design', 'Web Development',
    'Data Entry', 'Driving', 'Cooking', 'Cleaning', 'Music', 'Art & Craft',
    'Public Speaking', 'Translation', 'Legal', 'Accounting', 'Fitness Training'
];

function AdminEvents() {
    const scrollRef = useScrollAnimation();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [filters, setFilters] = useState({ search: '', category: '', status: '' });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        date: '',
        time: '',
        location: { address: '', city: '', state: '', coordinates: { lat: '', lng: '' } },
        maxVolunteers: '',
        requiredSkills: [],
        isQREnabled: true,
        status: 'upcoming'
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, [pagination.page, filters]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = { page: pagination.page, limit: pagination.limit, ...filters };
            const res = await eventAPI.getAll(params);
            const data = res.data;
            setEvents(data.events || data);
            if (data.pagination) setPagination({ ...pagination, ...data.pagination });
        } catch (err) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingEvent(null);
        setFormData({
            title: '', description: '', category: '', date: '', time: '',
            location: { address: '', city: '', state: '', coordinates: { lat: '', lng: '' } },
            maxVolunteers: '', requiredSkills: [], isQREnabled: true, status: 'upcoming'
        });
        setImageFile(null);
        setShowModal(true);
    };

    const openEditModal = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title || '',
            description: event.description || '',
            category: event.category || '',
            date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
            time: event.time || '',
            location: {
                address: event.location?.address || '',
                city: event.location?.city || '',
                state: event.location?.state || '',
                coordinates: {
                    lat: event.location?.coordinates?.lat || '',
                    lng: event.location?.coordinates?.lng || ''
                }
            },
            maxVolunteers: event.maxVolunteers || '',
            requiredSkills: event.requiredSkills || [],
            isQREnabled: event.isQREnabled || true,
            status: event.status || 'upcoming'
        });
        setImageFile(null);
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('location.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                location: { ...formData.location, [field]: value }
            });
        } else if (name.startsWith('coordinates.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                location: {
                    ...formData.location,
                    coordinates: { ...formData.location.coordinates, [field]: value }
                }
            });
        } else if (name === 'isQREnabled') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSkillToggle = (skill) => {
        const skills = formData.requiredSkills.includes(skill)
            ? formData.requiredSkills.filter(s => s !== skill)
            : [...formData.requiredSkills, skill];
        setFormData({ ...formData, requiredSkills: skills });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.category || !formData.date) {
            toast.error('Please fill in all required fields');
            return;
        }

        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        submitData.append('category', formData.category);
        submitData.append('date', formData.date);
        submitData.append('time', formData.time);
        submitData.append('location', JSON.stringify(formData.location));
        if (formData.maxVolunteers) submitData.append('maxVolunteers', formData.maxVolunteers);
        submitData.append('requiredSkills', JSON.stringify(formData.requiredSkills));
        submitData.append('isQREnabled', formData.isQREnabled);
        submitData.append('status', formData.status);
        if (imageFile) submitData.append('image', imageFile);

        try {
            if (editingEvent) {
                await eventAPI.update(editingEvent._id, submitData);
                toast.success('Event updated successfully');
            } else {
                await eventAPI.create(submitData);
                toast.success('Event created successfully');
            }
            setShowModal(false);
            fetchEvents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save event');
        }
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await eventAPI.delete(eventId);
            toast.success('Event deleted successfully');
            fetchEvents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete event');
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPagination({ ...pagination, page: 1 });
    };

    return (
        <div className="admin-events-page" ref={scrollRef}>
            <div className="page-header scroll-animate">
                <h1><FiCalendar /> Event Management</h1>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <FiPlus /> Create New Event
                </button>
            </div>

            {/* Filters */}
            <div className="search-filter-bar">
                <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search events..." className="search-input" />
                </div>
                <select name="category" value={filters.category} onChange={handleFilterChange}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Events Table */}
            {loading ? (
                <div className="loading-screen">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="empty-state">
                    <FiCalendar size={64} />
                    <h3>No Events Found</h3>
                    <p>Create your first event to get started.</p>
                    <button className="btn btn-primary" onClick={openCreateModal}><FiPlus /> Create Event</button>
                </div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Volunteers</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                <tr key={event._id}>
                                    <td>
                                        <div className="table-event-info">
                                            {event.image && <img src={event.image} alt="" className="table-thumb" />}
                                            <div>
                                                <strong>{event.title}</strong>
                                                <p className="table-sub">{event.description?.substring(0, 50)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-category">{event.category}</span></td>
                                    <td>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                    <td>{event.location?.city || 'TBD'}</td>
                                    <td>{event.currentVolunteers || 0}/{event.maxVolunteers || '∞'}</td>
                                    <td><span className={`badge badge-${event.status}`}>{event.status}</span></td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn btn-outline btn-sm" onClick={() => openEditModal(event)}><FiEdit /> Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(event._id)}><FiTrash2 /> Delete</button>
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

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                            <button onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label>Title *</label>
                                <input type="text" name="title" value={formData.title} onChange={handleFormChange} required />
                            </div>
                            <div className="form-group">
                                <label>Description *</label>
                                <textarea name="description" value={formData.description} onChange={handleFormChange} rows={4} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select name="category" value={formData.category} onChange={handleFormChange} required>
                                        <option value="">Select Category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange}>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input type="date" name="date" value={formData.date} onChange={handleFormChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input type="time" name="time" value={formData.time} onChange={handleFormChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Max Volunteers</label>
                                <input type="number" name="maxVolunteers" value={formData.maxVolunteers} onChange={handleFormChange} min="1" placeholder="Leave empty for unlimited" />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <div className="form-row">
                                    <input type="text" name="location.address" value={formData.location.address} onChange={handleFormChange} placeholder="Address" />
                                    <input type="text" name="location.city" value={formData.location.city} onChange={handleFormChange} placeholder="City" />
                                </div>
                                <div className="form-row">
                                    <input type="text" name="location.state" value={formData.location.state} onChange={handleFormChange} placeholder="State" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Required Skills</label>
                                <div className="skills-grid">
                                    {SKILLS_OPTIONS.map(skill => (
                                        <button key={skill} type="button" className={`skill-tag ${formData.requiredSkills.includes(skill) ? 'selected' : ''}`} onClick={() => handleSkillToggle(skill)}>
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Event Image</label>
                                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                            </div>
                            <div className="form-group checkbox-label">
                                <input type="checkbox" name="isQREnabled" checked={formData.isQREnabled} onChange={handleFormChange} />
                                Enable QR Code Attendance
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary"><FiSave /> {editingEvent ? 'Update Event' : 'Create Event'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminEvents;

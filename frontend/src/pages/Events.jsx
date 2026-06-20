import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { eventAPI } from '../services/api';
import { FiCalendar, FiMapPin, FiUsers, FiSearch, FiFilter, FiArrowRight, FiClock, FiStar, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CATEGORIES = [
    'Education', 'Health', 'Environment', 'Social Service', 'Fundraising',
    'Community Development', 'Youth Empowerment', 'Women Empowerment', 'Disaster Relief', 'Other'
];

function Events() {
    const { user } = useAuth();
    const scrollRef = useScrollAnimation();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        city: '',
        date: '',
        skills: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [pagination.page, filters]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            };
            const res = await eventAPI.getAll(params);
            const data = res.data;
            setEvents(data.events || data);
            if (data.pagination) {
                setPagination({ ...pagination, ...data.pagination });
            }
        } catch (err) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
        setPagination({ ...pagination, page: 1 });
    };

    const clearFilters = () => {
        setFilters({ search: '', category: '', city: '', date: '', skills: '' });
        setPagination({ ...pagination, page: 1 });
    };

    const handleRegister = async (eventId) => {
        try {
            await eventAPI.register(eventId);
            toast.success('Successfully registered for the event!');
            fetchEvents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register for event');
        }
    };

    const handleCancel = async (eventId) => {
        try {
            await eventAPI.cancel(eventId);
            toast.success('Registration cancelled');
            fetchEvents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel registration');
        }
    };

    const isRegistered = (event) => {
        return event.registeredVolunteers?.some(
            rv => rv.volunteer?._id === user?._id || rv.volunteer === user?._id
        );
    };

    return (
        <div className="events-page" ref={scrollRef}>
            <div className="page-header scroll-animate">
                <h1><FiCalendar /> Volunteer Events</h1>
                <p>Discover and register for events that match your skills and interests</p>
            </div>

            {/* Search & Filter Bar */}
            <div className="search-filter-bar">
                <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search events by title or description..."
                        className="search-input"
                    />
                </div>
                <button className="btn btn-outline filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
                    <FiFilter /> Filters
                    {Object.values(filters).some(v => v && v !== '') && <span className="filter-count-dot"></span>}
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="filter-panel">
                    <div className="filter-group">
                        <label>Category</label>
                        <select name="category" value={filters.category} onChange={handleFilterChange}>
                            <option value="">All Categories</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>City</label>
                        <input type="text" name="city" value={filters.city} onChange={handleFilterChange} placeholder="Filter by city" />
                    </div>
                    <div className="filter-group">
                        <label>Date</label>
                        <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
                    </div>
                    <div className="filter-group">
                        <label>Required Skills</label>
                        <input type="text" name="skills" value={filters.skills} onChange={handleFilterChange} placeholder="Filter by skills" />
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                        <FiX /> Clear Filters
                    </button>
                </div>
            )}

            {/* Events Grid */}
            {loading ? (
                <div className="loading-screen">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="empty-state">
                    <FiCalendar size={64} />
                    <h3>No Events Found</h3>
                    <p>Try adjusting your filters or check back later for new events.</p>
                    {Object.values(filters).some(v => v && v !== '') && (
                        <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
                    )}
                </div>
            ) : (
                <div className="events-grid">
                    {events.map(event => (
                        <div key={event._id} className="event-card glass scroll-animate delay-2">
                            {event.image && (
                                <div className="event-card-image">
                                    <img src={event.image} alt={event.title} />
                                </div>
                            )}
                            <div className="event-card-body">
                                <div className="event-card-header">
                                    <span className="badge badge-category">{event.category}</span>
                                    <span className={`badge badge-${event.status}`}>{event.status}</span>
                                </div>
                                <h3 className="event-card-title">{event.title}</h3>
                                <p className="event-card-desc">{event.description?.substring(0, 100)}{event.description?.length > 100 ? '...' : ''}</p>

                                <div className="event-card-meta">
                                    <span><FiCalendar /> {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    <span><FiClock /> {event.time}</span>
                                    <span><FiMapPin /> {event.location?.city || 'TBD'}</span>
                                </div>

                                {event.requiredSkills?.length > 0 && (
                                    <div className="event-card-skills">
                                        {event.requiredSkills.slice(0, 3).map(skill => (
                                            <span key={skill} className="skill-tag small">{skill}</span>
                                        ))}
                                        {event.requiredSkills.length > 3 && <span className="skill-tag small">+{event.requiredSkills.length - 3}</span>}
                                    </div>
                                )}

                                <div className="event-card-footer">
                                    <span className="volunteer-count">
                                        <FiUsers /> {event.currentVolunteers || 0}/{event.maxVolunteers || '∞'}
                                    </span>
                                    <div className="event-card-actions">
                                        {isRegistered(event) ? (
                                            <button className="btn btn-outline btn-sm registered-btn" onClick={() => handleCancel(event._id)}>
                                                Cancel Registration
                                            </button>
                                        ) : (
                                            <button className="btn btn-primary btn-sm" onClick={() => handleRegister(event._id)} disabled={event.isFull}>
                                                {event.isFull ? 'Full' : 'Register'}
                                            </button>
                                        )}
                                        <Link to={`/events/${event._id}`} className="btn btn-outline btn-sm">
                                            View Details <FiArrowRight />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    >
                        Previous
                    </button>
                    <span className="pagination-info">Page {pagination.page} of {pagination.pages}</span>
                    <button
                        className="pagination-btn"
                        disabled={pagination.page === pagination.pages}
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default Events;

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { eventAPI, attendanceAPI, feedbackAPI } from '../services/api';
import QRCode from 'react-qr-code';
import { FiCalendar, FiMapPin, FiUsers, FiClock, FiArrowLeft, FiCheckCircle, FiStar, FiMessageSquare, FiSend, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const scrollRef = useScrollAnimation();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registered, setRegistered] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: '' });
    const [attendanceData, setAttendanceData] = useState(null);
    const [feedbackStats, setFeedbackStats] = useState(null);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        setLoading(true);
        try {
            const res = await eventAPI.getOne(id);
            const eventData = res.data.event || res.data;
            setEvent(eventData);
            setRegistered(
                eventData.registeredVolunteers?.some(
                    rv => rv.volunteer?._id === user?._id || rv.volunteer === user?._id
                )
            );
        } catch (err) {
            toast.error('Failed to load event details');
            navigate('/events');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            await eventAPI.register(id);
            toast.success('Successfully registered for the event!');
            setRegistered(true);
            fetchEvent();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register');
        }
    };

    const handleCancel = async () => {
        try {
            await eventAPI.cancel(id);
            toast.success('Registration cancelled');
            setRegistered(false);
            fetchEvent();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel registration');
        }
    };

    const handleCheckIn = async () => {
        try {
            const res = await attendanceAPI.checkIn({
                eventId: id,
                method: 'self'
            });
            toast.success('Checked in successfully!');
            setAttendanceData(res.data.attendance || res.data);
            setShowQR(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to check in');
        }
    };

    const handleCheckOut = async () => {
        try {
            const res = await attendanceAPI.checkOut({
                eventId: id
            });
            toast.success(`Checked out! You volunteered ${res.data.hoursVolunteered || 0} hours.`);
            setAttendanceData(res.data.attendance || res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to check out');
        }
    };

    const handleGenerateQR = async () => {
        try {
            await eventAPI.generateQR(id, 'checkin');
            toast.success('QR code generated for this event');
            setShowQR(true);
            fetchEvent();
        } catch (err) {
            toast.error('Failed to generate QR code');
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            await feedbackAPI.submitVolunteerFeedback({
                eventId: id,
                rating: feedbackData.rating,
                comment: feedbackData.comment
            });
            toast.success('Feedback submitted successfully!');
            setShowFeedback(false);
            setFeedbackData({ rating: 5, comment: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit feedback');
        }
    };

    const fetchFeedbackStats = async () => {
        try {
            const res = await feedbackAPI.getFeedbackStats(id);
            setFeedbackStats(res.data);
        } catch (err) {
            // silently fail
        }
    };

    if (loading) {
        return <div className="loading-screen">Loading event details...</div>;
    }

    if (!event) {
        return <div className="empty-state"><p>Event not found</p></div>;
    }

    return (
        <div className="event-detail-page" ref={scrollRef}>
            <button className="btn btn-outline back-btn" onClick={() => navigate('/events')}>
                <FiArrowLeft /> Back to Events
            </button>

            <div className="event-detail-card glass scroll-animate">
                {event.image && (
                    <div className="event-detail-image">
                        <img src={event.image} alt={event.title} />
                    </div>
                )}

                <div className="event-detail-header">
                    <div className="event-detail-badges">
                        <span className="badge badge-category">{event.category}</span>
                        <span className={`badge badge-${event.status}`}>{event.status}</span>
                    </div>
                    <h1>{event.title}</h1>
                    <p className="event-detail-organizer">Organized by {event.organizer?.name || 'Nayepankh Foundation'}</p>
                </div>

                <div className="event-detail-info-grid">
                    <div className="info-item glass">
                        <FiCalendar />
                        <div>
                            <label>Date</label>
                            <span>{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                    <div className="info-item glass">
                        <FiClock />
                        <div>
                            <label>Time</label>
                            <span>{event.time || 'TBD'}</span>
                        </div>
                    </div>
                    <div className="info-item glass">
                        <FiMapPin />
                        <div>
                            <label>Location</label>
                            <span>{event.location?.address || 'TBD'}, {event.location?.city || ''}</span>
                        </div>
                    </div>
                    <div className="info-item glass">
                        <FiUsers />
                        <div>
                            <label>Volunteers</label>
                            <span>{event.currentVolunteers || 0} / {event.maxVolunteers || '∞'} registered</span>
                        </div>
                    </div>
                </div>

                <div className="event-detail-description">
                    <h3>About This Event</h3>
                    <p>{event.description}</p>
                </div>

                {event.requiredSkills?.length > 0 && (
                    <div className="event-detail-skills">
                        <h3>Required Skills</h3>
                        <div className="skills-grid">
                            {event.requiredSkills.map(skill => (
                                <span key={skill} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Registered Volunteers List */}
                {event.registeredVolunteers?.length > 0 && (
                    <div className="event-detail-volunteers">
                        <h3>Registered Volunteers ({event.registeredVolunteers.length})</h3>
                        <div className="volunteers-list">
                            {event.registeredVolunteers.map(rv => (
                                <div key={rv._id || rv.volunteer?._id} className="volunteer-mini-card">
                                    <div className="avatar-small">
                                        {rv.volunteer?.photo ? (
                                            <img src={rv.volunteer.photo} alt={rv.volunteer.name} />
                                        ) : (
                                            <span>{rv.volunteer?.name?.charAt(0) || '?'}</span>
                                        )}
                                    </div>
                                    <span>{rv.volunteer?.name || 'Volunteer'}</span>
                                    <span className={`badge badge-${rv.status}`}>{rv.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="event-detail-actions">
                    {user?.role === 'volunteer' && (
                        <>
                            {registered ? (
                                <div className="action-group">
                                    <span className="registered-indicator"><FiCheckCircle /> You are registered</span>
                                    <button className="btn btn-outline" onClick={handleCancel}>Cancel Registration</button>
                                    {!attendanceData?.checkInTime && (
                                        <button className="btn btn-primary" onClick={handleCheckIn}>Check In</button>
                                    )}
                                    {attendanceData?.checkInTime && !attendanceData?.checkOutTime && (
                                        <button className="btn btn-primary" onClick={handleCheckOut}>Check Out</button>
                                    )}
                                    {attendanceData?.checkOutTime && (
                                        <span className="checked-out-msg">
                                            <FiCheckCircle /> Completed — {attendanceData.hoursVolunteered} hours
                                        </span>
                                    )}
                                    <button className="btn btn-outline" onClick={() => setShowFeedback(true)}>
                                        <FiMessageSquare /> Give Feedback
                                    </button>
                                </div>
                            ) : (
                                <button className="btn btn-primary btn-lg" onClick={handleRegister} disabled={event.isFull}>
                                    {event.isFull ? 'Event is Full' : 'Register for This Event'}
                                </button>
                            )}
                        </>
                    )}

                    {user?.role === 'admin' && (
                        <div className="action-group">
                            <button className="btn btn-primary" onClick={handleGenerateQR}>Generate QR Code</button>
                            <Link to={`/admin/events`} className="btn btn-outline">Manage Event</Link>
                        </div>
                    )}
                </div>

                {/* QR Code Modal */}
                {showQR && event.qrCode && (
                    <div className="qr-modal">
                        <div className="qr-modal-content">
                            <button className="qr-close-btn" onClick={() => setShowQR(false)}><FiX /></button>
                            <h3>Event QR Code</h3>
                            <p>Scan this QR code to check in to the event</p>
                            <div className="qr-display">
                                <QRCode value={event.qrCode} size={200} />
                            </div>
                            <p className="qr-event-name">{event.title}</p>
                            <p className="qr-expiry">Valid for 24 hours</p>
                        </div>
                    </div>
                )}

                {/* Feedback Modal */}
                {showFeedback && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3><FiStar /> Event Feedback</h3>
                                <button onClick={() => setShowFeedback(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleFeedbackSubmit} className="modal-body">
                                <div className="form-group">
                                    <label>Rating</label>
                                    <div className="rating-stars-input">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={`star-btn ${star <= feedbackData.rating ? 'active' : ''}`}
                                                onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                                            >
                                                <FiStar />
                                            </button>
                                        ))}
                                        <span className="rating-value">{feedbackData.rating}/5</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Comment</label>
                                    <textarea
                                        value={feedbackData.comment}
                                        onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                                        placeholder="Share your experience..."
                                        rows={4}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    <FiSend /> Submit Feedback
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EventDetail;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, driveAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { FiClock, FiCheckCircle, FiXCircle, FiDownload, FiUser, FiInfo, FiTag, FiCalendar, FiMapPin, FiActivity } from 'react-icons/fi';

function VolunteerDashboard() {
    const { user } = useAuth();
    const [downloading, setDownloading] = useState(false);

    // Drives states
    const [drives, setDrives] = useState([]);
    const [drivesLoading, setDrivesLoading] = useState(false);
    const [registeringMap, setRegisteringMap] = useState({});

    useEffect(() => {
        if (user && user.status === 'approved') {
            fetchDrives();
        }
    }, [user]);

    const fetchDrives = async () => {
        try {
            setDrivesLoading(true);
            const res = await driveAPI.getDrives();
            setDrives(res.data.drives || []);
        } catch (err) {
            console.error('Failed to load drives:', err);
        } finally {
            setDrivesLoading(false);
        }
    };

    const handleRegisterDrive = async (driveId) => {
        try {
            setRegisteringMap(prev => ({ ...prev, [driveId]: true }));
            const res = await driveAPI.registerDrive(driveId);
            toast.success(res.data.message || 'Registered successfully for the drive!');
            fetchDrives();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register for drive');
            console.error(err);
        } finally {
            setRegisteringMap(prev => ({ ...prev, [driveId]: false }));
        }
    };

    const handleUnregisterDrive = async (driveId) => {
        if (!window.confirm('Are you sure you want to unregister from this drive?')) {
            return;
        }

        try {
            setRegisteringMap(prev => ({ ...prev, [driveId]: true }));
            const res = await driveAPI.unregisterDrive(driveId);
            toast.success(res.data.message || 'Unregistered successfully');
            fetchDrives();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to unregister');
            console.error(err);
        } finally {
            setRegisteringMap(prev => ({ ...prev, [driveId]: false }));
        }
    };

    const handleDownloadCertificate = async () => {
        try {
            setDownloading(true);
            const res = await authAPI.downloadCertificate();
            
            // Create blob link to download
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `NP_Volunteer_Certificate_${user.name.replace(/\s+/g, '_')}.pdf`);
            
            // Append to html page, trigger click, then remove
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('Certificate downloaded successfully!');
        } catch (err) {
            toast.error('Failed to download certificate.');
            console.error(err);
        } finally {
            setDownloading(false);
        }
    };

    if (!user) {
        return <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>Loading user details...</div>;
    }

    const renderStatusBanner = () => {
        switch (user.status) {
            case 'pending':
                return (
                    <div className="status-banner pending">
                        <FiClock className="status-icon" />
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Registration Pending Approval</h3>
                            <p style={{ fontSize: '0.85rem', marginTop: '0.2rem', opacity: 0.9 }}>
                                Thank you for registering! Your volunteer profile is currently under review by the NayePankh Foundation team.
                            </p>
                        </div>
                    </div>
                );
            case 'approved':
                return (
                    <div className="status-banner approved">
                        <FiCheckCircle className="status-icon" />
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Profile Approved</h3>
                            <p style={{ fontSize: '0.85rem', marginTop: '0.2rem', opacity: 0.9 }}>
                                Congratulations! Your profile is verified. You are now an active registered volunteer of NayePankh Foundation.
                            </p>
                        </div>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="status-banner rejected">
                        <FiXCircle className="status-icon" />
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Registration Rejected</h3>
                            <p style={{ fontSize: '0.85rem', marginTop: '0.2rem', opacity: 0.9 }}>
                                We regret to inform you that your application could not be approved at this time. Please contact support for feedback.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.2rem' }}>Volunteer Portal</h1>
                <p style={{ color: 'var(--text-muted)' }}>Welcome back to your central command space.</p>
            </div>

            {renderStatusBanner()}

            <div className="dashboard-grid">
                {/* Left Card: Basic Profile Info */}
                <div className="glass-card profile-card">
                    <div className="profile-avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="profile-name">{user.name}</h2>
                    <p className="profile-email">{user.email}</p>
                    <span className={`badge badge-${user.status}`}>
                        {user.status}
                    </span>

                    <div className="info-list" style={{ marginTop: '2rem' }}>
                        <div className="info-item">
                            <span className="info-label">Phone</span>
                            <span>{user.phone}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Age</span>
                            <span>{user.age} yrs</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Role</span>
                            <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                        </div>
                    </div>

                    {user.status === 'approved' && (
                        <button
                            onClick={handleDownloadCertificate}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '2rem' }}
                            disabled={downloading}
                        >
                            <FiDownload /> {downloading ? 'Downloading...' : 'Download Certificate'}
                        </button>
                    )}
                </div>

                {/* Right Card: Preferences */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                            <FiTag /> Professional Skills
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                            Skills you have registered for volunteering matches:
                        </p>
                        <div className="tags-list">
                            {user.skills && user.skills.length > 0 ? (
                                user.skills.map(skill => (
                                    <span key={skill} className="tag">{skill}</span>
                                ))
                            ) : (
                                <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No skills selected.</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                            <FiClock /> Time Availability
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                            Preferred availability slots selected:
                        </p>
                        <div className="tags-list">
                            {user.availability && user.availability.length > 0 ? (
                                user.availability.map(slot => (
                                    <span key={slot} className="tag">{slot}</span>
                                ))
                            ) : (
                                <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No availability slots selected.</span>
                            )}
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                            <FiInfo /> What's next?
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                            Once approved, you will be contacted by the event coordinators on your email or phone for physical or remote volunteering events. Keep check on your credentials!
                        </p>
                    </div>
                </div>
            </div>

            {user.status === 'approved' && (
                <div style={{ marginTop: '3rem' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                        <FiActivity style={{ color: 'var(--primary)' }} /> Community Volunteering Drives
                    </h2>
                    
                    {drivesLoading ? (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Loading available drives...
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                            
                            {/* Available drives */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                                    Available Drives
                                </h3>
                                
                                {drives.filter(d => d.status === 'active' || d.status === 'upcoming').length === 0 ? (
                                    <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No active or upcoming drives are available at the moment. Check back later!
                                    </div>
                                ) : (
                                    drives.filter(d => d.status === 'active' || d.status === 'upcoming').map(drive => {
                                        const isJoined = drive.volunteers && drive.volunteers.some(v => v._id === user.id || v === user.id);
                                        const regCount = drive.volunteers ? drive.volunteers.length : 0;
                                        const isFull = regCount >= drive.maxVolunteers;
                                        const formattedDate = new Date(drive.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

                                        return (
                                            <div key={drive._id} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '1.2rem', color: '#fff' }}>{drive.title}</h4>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Organized by {drive.organizer || 'NayePankh Foundation'}</p>
                                                    </div>
                                                    {isJoined ? (
                                                        <span className="badge badge-approved">Joined</span>
                                                    ) : isFull ? (
                                                        <span className="badge badge-rejected">Full</span>
                                                    ) : (
                                                        <span className="badge badge-pending">{drive.status}</span>
                                                    )}
                                                </div>
                                                
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                                                    {drive.description}
                                                </p>

                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <FiCalendar style={{ color: 'var(--primary)' }} />
                                                        <span>{formattedDate}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <FiMapPin style={{ color: 'var(--secondary)' }} />
                                                        <span>{drive.location}</span>
                                                    </div>
                                                </div>

                                                {drive.skillsRequired && drive.skillsRequired.length > 0 && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                                                        {drive.skillsRequired.map(s => (
                                                            <span key={s} className="tag" style={{ padding: '0.15rem 0.35rem', fontSize: '0.7rem' }}>
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {regCount} / {drive.maxVolunteers} spots filled
                                                    </span>
                                                    {isJoined ? (
                                                        <button 
                                                            onClick={() => handleUnregisterDrive(drive._id)}
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                            disabled={registeringMap[drive._id]}
                                                        >
                                                            {registeringMap[drive._id] ? 'Unregistering...' : 'Leave Drive'}
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleRegisterDrive(drive._id)}
                                                            className="btn btn-primary"
                                                            style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem' }}
                                                            disabled={isFull || registeringMap[drive._id]}
                                                        >
                                                            {registeringMap[drive._id] ? 'Registering...' : 'Join Drive'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            
                            {/* My drives */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                                    My Schedule
                                </h3>
                                
                                {drives.filter(d => d.volunteers && d.volunteers.some(v => v._id === user.id || v === user.id)).length === 0 ? (
                                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        You haven't joined any drives yet. Click "Join Drive" to register!
                                    </div>
                                ) : (
                                    drives.filter(d => d.volunteers && d.volunteers.some(v => v._id === user.id || v === user.id)).map(drive => {
                                        const formattedDate = new Date(drive.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                        return (
                                            <div key={drive._id} className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>{drive.title}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    <FiCalendar />
                                                    <span>{formattedDate}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    <FiMapPin />
                                                    <span>{drive.location}</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleUnregisterDrive(drive._id)}
                                                    style={{ 
                                                        background: 'none', 
                                                        border: 'none', 
                                                        color: 'var(--danger)', 
                                                        cursor: 'pointer', 
                                                        fontSize: '0.8rem', 
                                                        textAlign: 'left', 
                                                        padding: 0, 
                                                        marginTop: '0.5rem',
                                                        fontWeight: '600',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                    disabled={registeringMap[drive._id]}
                                                >
                                                    Leave Drive
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default VolunteerDashboard;

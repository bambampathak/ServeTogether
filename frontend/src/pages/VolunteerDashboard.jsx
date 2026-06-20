import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { FiClock, FiCheckCircle, FiXCircle, FiDownload, FiUser, FiInfo, FiTag } from 'react-icons/fi';

function VolunteerDashboard() {
    const { user } = useAuth();
    const [downloading, setDownloading] = useState(false);

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
        </div>
    );
}

export default VolunteerDashboard;

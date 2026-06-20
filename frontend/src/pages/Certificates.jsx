import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { certificateAPI } from '../services/api';
import { FiFileText, FiDownload, FiCalendar, FiClock, FiSearch, FiEye, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Certificates() {
    const scrollRef = useScrollAnimation();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [previewCert, setPreviewCert] = useState(null);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        setLoading(true);
        try {
            const res = await certificateAPI.getMyCertificates();
            setCertificates(res.data.certificates || res.data || []);
        } catch (err) {
            toast.error('Failed to load certificates');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (certId) => {
        try {
            const res = await certificateAPI.download(certId);
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `certificate-${certId}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('Certificate downloaded!');
        } catch (err) {
            toast.error('Failed to download certificate');
        }
    };

    const filteredCertificates = certificates.filter(cert =>
        cert.eventName?.toLowerCase().includes(search.toLowerCase()) ||
        cert.certificateId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="certificates-page" ref={scrollRef}>
            <div className="page-header scroll-animate">
                <h1><FiFileText /> My Certificates</h1>
                <p>View and download your volunteer certificates</p>
            </div>

            {/* Search */}
            <div className="search-filter-bar">
                <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search certificates by event name or ID..."
                        className="search-input"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card glass scroll-animate delay-1">
                    <div className="stat-icon"><FiAward /></div>
                    <div className="stat-info">
                        <span className="stat-number">{certificates.length}</span>
                        <span className="stat-label">Total Certificates</span>
                    </div>
                </div>
                <div className="stat-card glass scroll-animate delay-2">
                    <div className="stat-icon"><FiClock /></div>
                    <div className="stat-info">
                        <span className="stat-number">
                            {certificates.reduce((sum, c) => sum + (c.hoursCompleted || 0), 0)}
                        </span>
                        <span className="stat-label">Certified Hours</span>
                    </div>
                </div>
            </div>

            {/* Certificates Grid */}
            {loading ? (
                <div className="loading-screen">Loading certificates...</div>
            ) : filteredCertificates.length === 0 ? (
                <div className="empty-state">
                    <FiFileText size={64} />
                    <h3>No Certificates Yet</h3>
                    <p>Complete volunteer events to earn certificates. Certificates are issued after event completion and attendance verification.</p>
                </div>
            ) : (
                <div className="certificates-grid">
                    {filteredCertificates.map(cert => (
                        <div key={cert._id} className="certificate-card glass scroll-animate delay-2">
                            <div className="certificate-header">
                                <div className="certificate-icon">📜</div>
                                <span className={`badge badge-${cert.status}`}>{cert.status}</span>
                            </div>
                            <div className="certificate-body">
                                <h3>{cert.eventName}</h3>
                                <p className="certificate-id">ID: {cert.certificateId}</p>
                                <div className="certificate-meta">
                                    <span><FiCalendar /> {cert.eventDate ? new Date(cert.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                                    <span><FiClock /> {cert.hoursCompleted || 0} hours</span>
                                </div>
                                <p className="certificate-issued">Issued by: {cert.issuedBy || 'Nayepankh Foundation'}</p>
                            </div>
                            <div className="certificate-actions">
                                <button className="btn btn-primary btn-sm" onClick={() => handleDownload(cert._id)}>
                                    <FiDownload /> Download PDF
                                </button>
                                <button className="btn btn-outline btn-sm" onClick={() => setPreviewCert(cert)}>
                                    <FiEye /> View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewCert && (
                <div className="modal-overlay" onClick={() => setPreviewCert(null)}>
                    <div className="modal-content certificate-preview-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Certificate Details</h3>
                            <button onClick={() => setPreviewCert(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="certificate-preview">
                                <div className="cert-preview-header">
                                    <span className="cert-logo">🤝</span>
                                    <h2>Nayepankh Foundation</h2>
                                    <p>Volunteer Certificate of Appreciation</p>
                                </div>
                                <div className="cert-preview-body">
                                    <p className="cert-text">This certificate is proudly presented to</p>
                                    <h3 className="cert-volunteer-name">{previewCert.volunteerName}</h3>
                                    <p className="cert-text">for their dedicated volunteer service at</p>
                                    <h4 className="cert-event-name">{previewCert.eventName}</h4>
                                    <p className="cert-details">
                                        on {previewCert.eventDate ? new Date(previewCert.eventDate).toLocaleDateString('en-IN') : 'N/A'}
                                        — completing {previewCert.hoursCompleted || 0} volunteer hours
                                    </p>
                                </div>
                                <div className="cert-preview-footer">
                                    <div className="cert-id-display">Certificate ID: {previewCert.certificateId}</div>
                                    <div className="cert-issued-display">Issued by: {previewCert.issuedBy || 'Nayepankh Foundation'}</div>
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={() => handleDownload(previewCert._id)}>
                                <FiDownload /> Download PDF Certificate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Certificates;

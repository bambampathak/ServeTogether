import { useState, useEffect } from 'react';
import { adminAPI, driveAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { FiSearch, FiCheck, FiX, FiDownload, FiUsers, FiClock, FiFileText, FiAward, FiPlus, FiEdit2, FiTrash2, FiCalendar, FiMapPin, FiArrowLeft, FiActivity } from 'react-icons/fi';

const SKILLS_OPTIONS = [
    'Teaching', 'Event Management', 'Graphic Design', 'Social Media', 
    'Fundraising', 'Content Writing', 'Field Work', 'Photography', 'Logistics'
];

function AdminDashboard() {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [csvDownloading, setCsvDownloading] = useState(false);
    const [pdfDownloading, setPdfDownloading] = useState(false);

    // Drives related states
    const [activeTab, setActiveTab] = useState('volunteers'); // 'volunteers' or 'drives'
    const [drives, setDrives] = useState([]);
    const [drivesLoading, setDrivesLoading] = useState(false);
    const [viewingDriveVolunteers, setViewingDriveVolunteers] = useState(null); // drive object or null
    const [showDriveModal, setShowDriveModal] = useState(false);
    const [editingDrive, setEditingDrive] = useState(null); // null for create, drive object for edit
    const [driveForm, setDriveForm] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        skillsRequired: [],
        maxVolunteers: '',
        status: 'upcoming',
        organizer: 'NayePankh Foundation'
    });

    useEffect(() => {
        fetchVolunteers();
        fetchDrives();
    }, [search, statusFilter, skillFilter]);

    const fetchDrives = async () => {
        try {
            setDrivesLoading(true);
            const res = await driveAPI.getDrives();
            const fetchedDrives = res.data.drives || [];
            setDrives(fetchedDrives);
            
            // Keep viewing volunteer list updated if details modal/screen is open
            if (viewingDriveVolunteers) {
                const updated = fetchedDrives.find(d => d._id === viewingDriveVolunteers._id);
                if (updated) {
                    setViewingDriveVolunteers(updated);
                }
            }
        } catch (err) {
            console.error('Failed to load drives:', err);
        } finally {
            setDrivesLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingDrive(null);
        setDriveForm({
            title: '',
            description: '',
            date: '',
            location: '',
            skillsRequired: [],
            maxVolunteers: '',
            status: 'upcoming',
            organizer: 'NayePankh Foundation'
        });
        setShowDriveModal(true);
    };

    const handleOpenEditModal = (drive) => {
        setEditingDrive(drive);
        
        // Format date to local datetime-local string (YYYY-MM-DDTHH:MM)
        const dateObj = new Date(drive.date);
        const tzOffset = dateObj.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(dateObj - tzOffset)).toISOString().slice(0, 16);

        setDriveForm({
            title: drive.title,
            description: drive.description,
            date: localISOTime,
            location: drive.location,
            skillsRequired: drive.skillsRequired || [],
            maxVolunteers: drive.maxVolunteers,
            status: drive.status,
            organizer: drive.organizer || 'NayePankh Foundation'
        });
        setShowDriveModal(true);
    };

    const handleDriveFormSubmit = async (e) => {
        e.preventDefault();
        if (!driveForm.title || !driveForm.description || !driveForm.date || !driveForm.location || !driveForm.maxVolunteers) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingDrive) {
                await driveAPI.updateDrive(editingDrive._id, driveForm);
                toast.success('Volunteering drive updated successfully!');
            } else {
                await driveAPI.createDrive(driveForm);
                toast.success('Volunteering drive created successfully!');
            }
            setShowDriveModal(false);
            fetchDrives();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save drive');
            console.error(err);
        }
    };

    const handleDeleteDrive = async (id) => {
        if (!window.confirm('Are you sure you want to delete this drive? All registration data will be lost.')) {
            return;
        }
        try {
            await driveAPI.deleteDrive(id);
            toast.success('Volunteering drive deleted');
            fetchDrives();
            if (viewingDriveVolunteers?._id === id) {
                setViewingDriveVolunteers(null);
            }
        } catch (err) {
            toast.error('Failed to delete drive');
            console.error(err);
        }
    };

    const handleToggleSkillInForm = (skill) => {
        const current = [...driveForm.skillsRequired];
        const idx = current.indexOf(skill);
        if (idx === -1) {
            current.push(skill);
        } else {
            current.splice(idx, 1);
        }
        setDriveForm({ ...driveForm, skillsRequired: current });
    };

    const fetchVolunteers = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (skillFilter) params.skill = skillFilter;

            const res = await adminAPI.getVolunteers(params);
            setVolunteers(res.data.volunteers || []);
            
            // If fetching all without filters, let's cache the general stats
            // For simple implementation, we calculate stats based on whatever is fetched or do a general fetch
            if (!search && !statusFilter && !skillFilter) {
                const list = res.data.volunteers || [];
                setStats({
                    total: list.length,
                    pending: list.filter(v => v.status === 'pending').length,
                    approved: list.filter(v => v.status === 'approved').length,
                    rejected: list.filter(v => v.status === 'rejected').length
                });
            }
        } catch (err) {
            toast.error('Failed to load volunteers data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await adminAPI.updateVolunteerStatus(id, newStatus);
            toast.success(`Volunteer status updated to ${newStatus}`);
            fetchVolunteers();
            
            // Trigger a silent reload of stats if filters are active
            if (search || statusFilter || skillFilter) {
                const res = await adminAPI.getVolunteers({});
                const list = res.data.volunteers || [];
                setStats({
                    total: list.length,
                    pending: list.filter(v => v.status === 'pending').length,
                    approved: list.filter(v => v.status === 'approved').length,
                    rejected: list.filter(v => v.status === 'rejected').length
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleExportCSV = async () => {
        try {
            setCsvDownloading(true);
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (skillFilter) params.skill = skillFilter;
            
            const res = await adminAPI.exportCSV(params);
            
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `NP_Volunteers_${statusFilter || 'All'}_${new Date().toLocaleDateString()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('CSV Report exported successfully!');
        } catch (err) {
            toast.error('Failed to export CSV report');
            console.error(err);
        } finally {
            setCsvDownloading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            setPdfDownloading(true);
            const res = await adminAPI.exportPDF();
            
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `NP_Volunteer_Demographics_Summary.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('PDF Summary Report downloaded successfully!');
        } catch (err) {
            toast.error('Failed to download PDF summary report');
            console.error(err);
        } finally {
            setPdfDownloading(false);
        }
    };

    // Calculate Demographic Statistics dynamically for CSS charts
    const calculateAgeDistribution = () => {
        const total = volunteers.length || 1;
        const under18 = volunteers.filter(v => v.age < 18).length;
        const youngAdult = volunteers.filter(v => v.age >= 18 && v.age <= 25).length;
        const adult = volunteers.filter(v => v.age >= 26 && v.age <= 40).length;
        const senior = volunteers.filter(v => v.age > 40).length;

        return [
            { label: 'Under 18', count: under18, pct: Math.round((under18 / total) * 100) },
            { label: '18 - 25 yrs', count: youngAdult, pct: Math.round((youngAdult / total) * 100) },
            { label: '26 - 40 yrs', count: adult, pct: Math.round((adult / total) * 100) },
            { label: '40+ yrs', count: senior, pct: Math.round((senior / total) * 100) }
        ];
    };

    const calculateAvailabilityDistribution = () => {
        const total = volunteers.length || 1;
        const slots = ['Weekdays', 'Weekends', 'Mornings', 'Evenings'];
        return slots.map(slot => {
            const count = volunteers.filter(v => v.availability && v.availability.includes(slot)).length;
            return {
                label: slot,
                count,
                pct: Math.round((count / total) * 100)
            };
        });
    };

    return (
        <div className="container" style={{ padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem' }}>Admin Panel</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage volunteer registrations and orchestrate community drives.</p>
                </div>
                {activeTab === 'volunteers' && (
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button
                            onClick={handleExportPDF}
                            className="btn btn-secondary"
                            disabled={pdfDownloading}
                        >
                            <FiFileText /> {pdfDownloading ? 'Generating PDF...' : 'Download PDF Summary'}
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="btn btn-primary"
                            disabled={csvDownloading}
                        >
                            <FiDownload /> {csvDownloading ? 'Exporting CSV...' : 'Export CSV'}
                        </button>
                    </div>
                )}
            </div>

            {/* Tab navigation */}
            <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setActiveTab('volunteers')} 
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'volunteers' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'volunteers' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                        padding: '0.75rem 0.5rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        fontFamily: 'var(--font-heading)'
                    }}
                >
                    Volunteers Review
                </button>
                <button 
                    onClick={() => setActiveTab('drives')} 
                    style={{
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'drives' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'drives' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                        padding: '0.75rem 0.5rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        fontFamily: 'var(--font-heading)'
                    }}
                >
                    Volunteering Drives
                </button>
            </div>

            {activeTab === 'volunteers' && (
                <>
                    {/* Metrics cards */}
                    <div className="admin-grid">
                        <div className="glass-card stat-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)' }}>
                                <span className="stat-label">Total Volunteers</span>
                                <FiUsers size={20} />
                            </div>
                            <div className="stat-num">{stats.total}</div>
                        </div>
                        <div className="glass-card stat-card" style={{ borderLeft: '3px solid var(--warning)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--warning)' }}>
                                <span className="stat-label">Pending Review</span>
                                <FiClock size={20} />
                            </div>
                            <div className="stat-num">{stats.pending}</div>
                        </div>
                        <div className="glass-card stat-card" style={{ borderLeft: '3px solid var(--success)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                                <span className="stat-label">Approved</span>
                                <FiCheck size={20} />
                            </div>
                            <div className="stat-num">{stats.approved}</div>
                        </div>
                        <div className="glass-card stat-card" style={{ borderLeft: '3px solid var(--danger)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                                <span className="stat-label">Rejected</span>
                                <FiX size={20} />
                            </div>
                            <div className="stat-num">{stats.rejected}</div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    {volunteers.length > 0 && (
                        <div className="charts-row">
                            <div className="glass-card chart-card">
                                <div className="chart-header">Age Demographics</div>
                                <div className="css-bar-chart">
                                    {calculateAgeDistribution().map(row => (
                                        <div key={row.label} className="chart-bar-row">
                                            <div className="chart-bar-label">{row.label}</div>
                                            <div className="chart-bar-container">
                                                <div className="chart-bar-fill" style={{ width: `${row.pct}%` }}></div>
                                            </div>
                                            <div className="chart-bar-value">{row.pct}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card chart-card">
                                <div className="chart-header">Availability Alignment</div>
                                <div className="css-bar-chart">
                                    {calculateAvailabilityDistribution().map(row => (
                                        <div key={row.label} className="chart-bar-row">
                                            <div className="chart-bar-label">{row.label}</div>
                                            <div className="chart-bar-container">
                                                <div className="chart-bar-fill" style={{ width: `${row.pct}%`, background: 'linear-gradient(90deg, var(--secondary), var(--accent))' }}></div>
                                            </div>
                                            <div className="chart-bar-value">{row.pct}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters bar & Volunteer list table */}
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="dashboard-actions">
                            <div className="filters-bar">
                                <select
                                    className="filter-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>

                                <select
                                    className="filter-select"
                                    value={skillFilter}
                                    onChange={(e) => setSkillFilter(e.target.value)}
                                >
                                    <option value="">All Skills</option>
                                    {SKILLS_OPTIONS.map(skill => (
                                        <option key={skill} value={skill}>{skill}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-input search-input"
                                    placeholder="Search name, email, tel..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Fetching volunteers...
                            </div>
                        ) : volunteers.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No volunteers match the query criteria.
                            </div>
                        ) : (
                            <div className="volunteer-table-container">
                                <table className="volunteer-table">
                                    <thead>
                                        <tr>
                                            <th>Volunteer</th>
                                            <th>Contact Details</th>
                                            <th>Age</th>
                                            <th>Registered Skills</th>
                                            <th>Availability</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {volunteers.map(v => (
                                            <tr key={v._id}>
                                                <td>
                                                    <div style={{ fontWeight: '600', color: '#fff' }}>{v.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        Registered {new Date(v.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '0.9rem' }}>{v.email}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.phone}</div>
                                                </td>
                                                <td>{v.age}</td>
                                                <td>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '200px' }}>
                                                        {v.skills && v.skills.map(s => (
                                                            <span key={s} className="tag" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', borderRadius: '4px' }}>
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '150px' }}>
                                                        {v.availability && v.availability.map(a => (
                                                            <span key={a} className="tag" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', borderRadius: '4px', background: 'rgba(46, 134, 171, 0.05)' }}>
                                                                {a}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-${v.status}`}>
                                                        {v.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="table-actions">
                                                        {v.status !== 'approved' && (
                                                            <button
                                                                onClick={() => handleStatusChange(v._id, 'approved')}
                                                                className="action-btn approve"
                                                                title="Approve Volunteer"
                                                            >
                                                                <FiCheck size={18} />
                                                            </button>
                                                        )}
                                                        {v.status !== 'rejected' && (
                                                            <button
                                                                onClick={() => handleStatusChange(v._id, 'rejected')}
                                                                className="action-btn reject"
                                                                title="Reject Volunteer"
                                                            >
                                                                <FiX size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'drives' && (
                <div>
                    {viewingDriveVolunteers ? (
                        /* VIEW REGISTERED VOLUNTEERS */
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                                <button 
                                    onClick={() => setViewingDriveVolunteers(null)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1rem' }}
                                >
                                    <FiArrowLeft /> Back to Drives
                                </button>
                                <div>
                                    <h2 style={{ fontSize: '1.8rem' }}>Registered Volunteers</h2>
                                    <p style={{ color: 'var(--text-muted)' }}>Drive: {viewingDriveVolunteers.title}</p>
                                </div>
                            </div>

                            {!viewingDriveVolunteers.volunteers || viewingDriveVolunteers.volunteers.length === 0 ? (
                                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No volunteers have registered for this drive yet.
                                </div>
                            ) : (
                                <div className="volunteer-table-container">
                                    <table className="volunteer-table">
                                        <thead>
                                            <tr>
                                                <th>Volunteer Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>System Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {viewingDriveVolunteers.volunteers.map(v => (
                                                <tr key={v._id}>
                                                    <td style={{ fontWeight: '600', color: '#fff' }}>{v.name}</td>
                                                    <td>{v.email}</td>
                                                    <td>{v.phone}</td>
                                                    <td>
                                                        <span className={`badge badge-${v.status}`}>
                                                            {v.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* DRIVES LIST */
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.8rem' }}>Volunteering Drives</h2>
                                <button onClick={handleOpenCreateModal} className="btn btn-primary">
                                    <FiPlus /> Create New Drive
                                </button>
                            </div>

                            {drivesLoading ? (
                                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Fetching volunteering drives...
                                </div>
                            ) : drives.length === 0 ? (
                                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No volunteering drives found. Click "Create New Drive" to add one.
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                                    {drives.map(drive => {
                                        const regCount = drive.volunteers ? drive.volunteers.length : 0;
                                        const fillPct = Math.min(100, Math.round((regCount / drive.maxVolunteers) * 100));
                                        const formattedDate = new Date(drive.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
                                        
                                        // Map status to badge color
                                        let statusColor = 'var(--warning)';
                                        if (drive.status === 'active') statusColor = 'var(--primary)';
                                        if (drive.status === 'completed') statusColor = 'var(--success)';
                                        if (drive.status === 'cancelled') statusColor = 'var(--danger)';

                                        return (
                                            <div key={drive._id} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                        <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>{drive.title}</h3>
                                                        <span 
                                                            className="badge" 
                                                            style={{ 
                                                                background: `rgba(${drive.status === 'completed' ? '16, 185, 129' : drive.status === 'cancelled' ? '239, 68, 68' : '46, 134, 171'}, 0.15)`,
                                                                color: statusColor,
                                                                border: `1px solid rgba(${drive.status === 'completed' ? '16, 185, 129' : drive.status === 'cancelled' ? '239, 68, 68' : '46, 134, 171'}, 0.2)`
                                                            }}
                                                        >
                                                            {drive.status}
                                                        </span>
                                                    </div>
                                                    
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '3.6rem', lineHeight: '1.2rem' }}>
                                                        {drive.description}
                                                    </p>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <FiCalendar style={{ color: 'var(--primary)' }} />
                                                            <span>{formattedDate}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <FiMapPin style={{ color: 'var(--secondary)' }} />
                                                            <span>{drive.location}</span>
                                                        </div>
                                                    </div>

                                                    <div style={{ marginTop: '1.25rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                                                            <span>Volunteers Registration</span>
                                                            <span style={{ fontWeight: '600', color: '#fff' }}>{regCount} / {drive.maxVolunteers} spots filled</span>
                                                        </div>
                                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${fillPct}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '3px' }}></div>
                                                        </div>
                                                    </div>

                                                    {drive.skillsRequired && drive.skillsRequired.length > 0 && (
                                                        <div style={{ marginTop: '1rem' }}>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                                {drive.skillsRequired.map(s => (
                                                                    <span key={s} className="tag" style={{ padding: '0.15rem 0.35rem', fontSize: '0.7rem' }}>
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                                    <button 
                                                        onClick={() => setViewingDriveVolunteers(drive)}
                                                        className="btn btn-secondary" 
                                                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                                                    >
                                                        <FiUsers /> Volunteers ({regCount})
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenEditModal(drive)}
                                                        className="btn btn-secondary" 
                                                        style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                                                        title="Edit Drive"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteDrive(drive._id)}
                                                        className="btn btn-secondary" 
                                                        style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--danger)' }}
                                                        title="Delete Drive"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* CREATE / EDIT DRIVE DIALOG */}
            {showDriveModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '1rem'
                }}>
                    <div className="glass-card" style={{
                        width: '100%',
                        maxWidth: '650px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        background: '#0e1320',
                        border: '1px solid var(--bg-card-border)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        position: 'relative'
                    }}>
                        <button 
                            onClick={() => setShowDriveModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1.25rem',
                                right: '1.25rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            <FiX size={24} />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>
                            {editingDrive ? 'Edit Volunteering Drive' : 'Create Volunteering Drive'}
                        </h2>
                        <form onSubmit={handleDriveFormSubmit}>
                            <div className="form-group">
                                <label className="form-label">Drive Title *</label>
                                <input 
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Tree Planting Campaign"
                                    value={driveForm.title}
                                    onChange={(e) => setDriveForm({...driveForm, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description *</label>
                                <textarea 
                                    className="form-input"
                                    rows="4"
                                    placeholder="Provide details about the drive..."
                                    value={driveForm.description}
                                    onChange={(e) => setDriveForm({...driveForm, description: e.target.value})}
                                    required
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Scheduled Date & Time *</label>
                                    <input 
                                        type="datetime-local"
                                        className="form-input"
                                        value={driveForm.date}
                                        onChange={(e) => setDriveForm({...driveForm, date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location/Venue *</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Central Park Sector 5"
                                        value={driveForm.location}
                                        onChange={(e) => setDriveForm({...driveForm, location: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Maximum Volunteers Allowed *</label>
                                    <input 
                                        type="number"
                                        className="form-input"
                                        min="1"
                                        placeholder="e.g. 25"
                                        value={driveForm.maxVolunteers}
                                        onChange={(e) => setDriveForm({...driveForm, maxVolunteers: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Organizer</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        value={driveForm.organizer}
                                        onChange={(e) => setDriveForm({...driveForm, organizer: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Drive Status</label>
                                <select 
                                    className="filter-select"
                                    style={{ width: '100%', padding: '0.75rem 1rem' }}
                                    value={driveForm.status}
                                    onChange={(e) => setDriveForm({...driveForm, status: e.target.value})}
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Required Skills (Select All That Apply)</label>
                                <div className="skills-grid">
                                    {SKILLS_OPTIONS.map(skill => {
                                        const isSelected = driveForm.skillsRequired.includes(skill);
                                        return (
                                            <div 
                                                key={skill}
                                                className={`selectable-card ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handleToggleSkillInForm(skill)}
                                            >
                                                {skill}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDriveModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingDrive ? 'Save Changes' : 'Create Drive'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;

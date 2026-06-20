import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { FiSearch, FiCheck, FiX, FiDownload, FiUsers, FiClock, FiFileText, FiAward } from 'react-icons/fi';

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

    useEffect(() => {
        fetchVolunteers();
    }, [search, statusFilter, skillFilter]);

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
                    <h1 style={{ fontSize: '2.2rem' }}>Admin Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage, filter, and export NayePankh volunteer registrations.</p>
                </div>
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
            </div>

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

            {/* Filters bar */}
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

                {/* Volunteers list table */}
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
        </div>
    );
}

export default AdminDashboard;

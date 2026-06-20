import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiShield, FiDatabase, FiLock, FiFileText } from 'react-icons/fi';

function Home() {
    const { user } = useAuth();

    return (
        <div className="container">
            <section className="hero">
                <h1>
                    Serve Together, <span style={{ color: 'var(--primary)' }}>Grow Together</span>
                </h1>
                <p>
                    Welcome to NayePankh Foundation's Volunteer Registration System. 
                    Sign up with your skills and availability, get verified by admins, and 
                    download your certified appreciation certificate.
                </p>
                <div className="hero-actions">
                    {user ? (
                        <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-primary">
                            Go to Dashboard <FiArrowRight />
                        </Link>
                    ) : (
                        <>
                            <Link to="/signup" className="btn btn-primary">
                                Register as Volunteer <FiArrowRight />
                            </Link>
                            <Link to="/login" className="btn btn-secondary">
                                Login Account
                            </Link>
                        </>
                    )}
                </div>
            </section>

            <section style={{ margin: '4rem 0 2rem 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>System Capabilities</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Core features designed for efficient volunteer management</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem'
                }}>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}><FiLock /></div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Secure Auth</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Full registration and JWT login mechanisms supporting password hashing and role-based routes.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}><FiDatabase /></div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Database Connected</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Persisted records with MongoDB Atlas backend models storing volunteer profiles, skills, and availability.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}><FiShield /></div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Admin Controls</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Interactive admin panel to search, filter by status or skill, and approve/reject pending registrations.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}><FiFileText /></div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Report Downloads</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Generate instant volunteer spreadsheets (CSV), demographic summaries (PDF), or customized volunteer certificates.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useCounterAnimation } from '../hooks/useCounterAnimation';
import { FiUsers, FiCalendar, FiAward, FiFileText, FiHeart, FiArrowRight, FiCheckCircle, FiTarget, FiTrendingUp, FiShield } from 'react-icons/fi';

function Home() {
    const { user } = useAuth();
    const scrollRef = useScrollAnimation();
    const counterRef = useCounterAnimation({ duration: 2500 });

    const features = [
        {
            icon: <FiUsers size={32} />,
            title: 'Volunteer Registration',
            desc: 'Sign up with your skills, availability, and interests. Get matched with events that need your expertise.'
        },
        {
            icon: <FiCalendar size={32} />,
            title: 'Event Management',
            desc: 'Discover and register for volunteer events. Track your participation and manage your schedule.'
        },
        {
            icon: <FiAward size={32} />,
            title: 'Leaderboard & Badges',
            desc: 'Earn points and badges for your contributions. Compete with fellow volunteers and get recognized.'
        },
        {
            icon: <FiFileText size={32} />,
            title: 'Certificates & Reports',
            desc: 'Download verified PDF certificates for completed events. Track your volunteer hours and impact.'
        },
        {
            icon: <FiTarget size={32} />,
            title: 'Skills-Based Matching',
            desc: 'Register with your unique skills and get recommended events that match your abilities.'
        },
        {
            icon: <FiTrendingUp size={32} />,
            title: 'Track Your Impact',
            desc: 'Monitor your volunteer hours, events attended, and community impact through your dashboard.'
        },
        {
            icon: <FiShield size={32} />,
            title: 'QR Attendance',
            desc: 'Check in and out of events using QR codes. Verified attendance ensures accurate hour tracking.'
        },
        {
            icon: <FiHeart size={32} />,
            title: 'Community Feedback',
            desc: 'Share your experience and rate events. Help improve future events with your valuable feedback.'
        }
    ];

    const stats = [
        { number: 500, suffix: '+', label: 'Active Volunteers' },
        { number: 100, suffix: '+', label: 'Events Organized' },
        { number: 10000, suffix: '+', label: 'Hours Volunteered' },
        { number: 50, suffix: '+', label: 'Communities Served' }
    ];

    const testimonials = [
        {
            name: 'Priya Sharma',
            role: 'Volunteer since 2023',
            text: 'ServeTogether made it so easy to find events that match my teaching skills. I\'ve been able to make a real difference in children\'s education.',
            avatar: '👩'
        },
        {
            name: 'Rahul Verma',
            role: 'Volunteer since 2022',
            text: 'The QR attendance system and certificates are amazing. I can now track all my volunteer hours for my college applications.',
            avatar: '👨'
        },
        {
            name: 'Anita Desai',
            role: 'Event Organizer',
            text: 'Managing events and tracking volunteer participation has never been easier. The dashboard gives me all the insights I need.',
            avatar: '👩‍💼'
        }
    ];

    return (
        <div className="home-page" ref={scrollRef}>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title scroll-animate">
                        Serve Together, <span className="highlight">Grow Together</span>
                    </h1>
                    <p className="hero-subtitle scroll-animate delay-1">
                        Join Nayepankh Foundation's volunteer community. Register your skills,
                        discover events, track your impact, and earn recognition for your contributions.
                    </p>
                    <div className="hero-actions scroll-animate delay-2">
                        {user ? (
                            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-primary btn-lg">
                                Go to Dashboard <FiArrowRight />
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup" className="btn btn-primary btn-lg">
                                    Become a Volunteer <FiArrowRight />
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-lg">
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="hero-stats" ref={counterRef}>
                        {stats.map((stat, index) => (
                            <div key={stat.label} className="hero-stat scroll-animate delay-3">
                                <span
                                    className="hero-stat-number counter-number"
                                    data-count={stat.number}
                                    data-suffix={stat.suffix}
                                >
                                    0
                                </span>
                                <span className="hero-stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="hero-visual scroll-animate-right delay-2">
                    <div className="hero-illustration">
                        <div className="hero-circle hero-circle-1">🤝</div>
                        <div className="hero-circle hero-circle-2">🌱</div>
                        <div className="hero-circle hero-circle-3">✨</div>
                        <div className="hero-circle hero-circle-4">💪</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header scroll-animate">
                    <h2>Everything You Need to Volunteer Effectively</h2>
                    <p>A comprehensive platform designed to make volunteering seamless and rewarding</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className={`feature-card glass scroll-animate delay-${Math.min(index + 1, 8)}`}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="section-header scroll-animate">
                    <h2>How It Works</h2>
                    <p>Get started in just a few simple steps</p>
                </div>
                <div className="steps-container">
                    <div className="step glass scroll-animate-left delay-1">
                        <div className="step-number">1</div>
                        <h3>Register & Create Profile</h3>
                        <p>Sign up with your details, skills, and availability preferences.</p>
                    </div>
                    <div className="step glass scroll-animate-left delay-2">
                        <div className="step-number">2</div>
                        <h3>Discover Events</h3>
                        <p>Browse upcoming events filtered by your skills and interests.</p>
                    </div>
                    <div className="step glass scroll-animate-left delay-3">
                        <div className="step-number">3</div>
                        <h3>Volunteer & Check In</h3>
                        <p>Attend events and use QR codes to check in for verified attendance.</p>
                    </div>
                    <div className="step glass scroll-animate-left delay-4">
                        <div className="step-number">4</div>
                        <h3>Earn Recognition</h3>
                        <p>Get certificates, badges, and climb the leaderboard for your contributions.</p>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials-section">
                <div className="section-header scroll-animate">
                    <h2>What Our Volunteers Say</h2>
                    <p>Real stories from our community members</p>
                </div>
                <div className="testimonials-grid">
                    {testimonials.map((t, index) => (
                        <div
                            key={t.name}
                            className={`testimonial-card glass scroll-animate delay-${index + 1}`}
                        >
                            <div className="testimonial-avatar">{t.avatar}</div>
                            <p className="testimonial-text">"{t.text}"</p>
                            <div className="testimonial-author">
                                <strong>{t.name}</strong>
                                <span>{t.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content scroll-animate-scale">
                    <h2>Ready to Make a Difference?</h2>
                    <p>Join hundreds of volunteers who are already creating positive change in their communities.</p>
                    {!user && (
                        <Link to="/signup" className="btn btn-primary btn-lg">
                            Start Volunteering Today <FiArrowRight />
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Home;

import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { volunteerAPI } from '../services/api';
import { FiAward, FiStar, FiClock, FiCalendar, FiTrendingUp, FiSearch, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Leaderboard() {
    const scrollRef = useScrollAnimation();
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('all');

    useEffect(() => {
        fetchLeaderboard();
    }, [timeFilter]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await volunteerAPI.getLeaderboard({ period: timeFilter });
            setVolunteers(res.data.volunteers || res.data.leaderboard || res.data || []);
        } catch (err) {
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const getRankBadge = (index) => {
        if (index === 0) return { emoji: '🥇', label: '1st', class: 'gold' };
        if (index === 1) return { emoji: '🥈', label: '2nd', class: 'silver' };
        if (index === 2) return { emoji: '🥉', label: '3rd', class: 'bronze' };
        return { emoji: null, label: `${index + 1}th`, class: '' };
    };

    return (
        <div className="leaderboard-page" ref={scrollRef}>
            <div className="page-header scroll-animate">
                <h1><FiAward /> Volunteer Leaderboard</h1>
                <p>Top volunteers making the biggest impact in our community</p>
            </div>

            {/* Time Filter */}
            <div className="leaderboard-filters">
                <button className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>All Time</button>
                <button className={`filter-btn ${timeFilter === 'monthly' ? 'active' : ''}`} onClick={() => setTimeFilter('monthly')}>This Month</button>
                <button className={`filter-btn ${timeFilter === 'weekly' ? 'active' : ''}`} onClick={() => setTimeFilter('weekly')}>This Week</button>
            </div>

            {/* Top 3 Highlight */}
            {volunteers.length >= 3 && (
                <div className="top-three">
                    <div className="top-volunteer-card silver glass scroll-animate delay-1">
                        <div className="top-rank">🥈</div>
                        <div className="top-avatar">
                            {volunteers[1].photo ? (
                                <img src={volunteers[1].photo} alt={volunteers[1].name} />
                            ) : (
                                <FiUser size={32} />
                            )}
                        </div>
                        <h3>{volunteers[1].name}</h3>
                        <div className="top-stats">
                            <span><FiStar /> {volunteers[1].points || 0} pts</span>
                            <span><FiClock /> {volunteers[1].totalHours || 0} hrs</span>
                        </div>
                    </div>
                    <div className="top-volunteer-card gold glass scroll-animate">
                        <div className="top-rank">🥇</div>
                        <div className="top-avatar">
                            {volunteers[0].photo ? (
                                <img src={volunteers[0].photo} alt={volunteers[0].name} />
                            ) : (
                                <FiUser size={32} />
                            )}
                        </div>
                        <h3>{volunteers[0].name}</h3>
                        <div className="top-stats">
                            <span><FiStar /> {volunteers[0].points || 0} pts</span>
                            <span><FiClock /> {volunteers[0].totalHours || 0} hrs</span>
                        </div>
                    </div>
                    <div className="top-volunteer-card bronze glass scroll-animate delay-2">
                        <div className="top-rank">🥉</div>
                        <div className="top-avatar">
                            {volunteers[2].photo ? (
                                <img src={volunteers[2].photo} alt={volunteers[2].name} />
                            ) : (
                                <FiUser size={32} />
                            )}
                        </div>
                        <h3>{volunteers[2].name}</h3>
                        <div className="top-stats">
                            <span><FiStar /> {volunteers[2].points || 0} pts</span>
                            <span><FiClock /> {volunteers[2].totalHours || 0} hrs</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Leaderboard Table */}
            {loading ? (
                <div className="loading-screen">Loading leaderboard...</div>
            ) : volunteers.length === 0 ? (
                <div className="empty-state">
                    <FiAward size={64} />
                    <h3>No Volunteers Yet</h3>
                    <p>The leaderboard will populate as volunteers start contributing.</p>
                </div>
            ) : (
                <div className="leaderboard-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Volunteer</th>
                                <th>Points</th>
                                <th>Hours</th>
                                <th>Events</th>
                                <th>Badges</th>
                            </tr>
                        </thead>
                        <tbody>
                            {volunteers.map((vol, index) => {
                                const rank = getRankBadge(index);
                                return (
                                    <tr key={vol._id} className={`rank-row ${rank.class}`}>
                                        <td className="rank-cell">
                                            {rank.emoji ? <span className="rank-emoji">{rank.emoji}</span> : <span className="rank-number">{index + 1}</span>}
                                        </td>
                                        <td className="volunteer-cell">
                                            <div className="volunteer-info">
                                                <div className="avatar-small">
                                                    {vol.photo ? (
                                                        <img src={vol.photo} alt={vol.name} />
                                                    ) : (
                                                        <span>{vol.name?.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <strong>{vol.name}</strong>
                                                    <span className="volunteer-city">{vol.city}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="points-cell">
                                            <FiStar /> {vol.points || 0}
                                        </td>
                                        <td className="hours-cell">
                                            <FiClock /> {vol.totalHours || 0}
                                        </td>
                                        <td className="events-cell">
                                            <FiCalendar /> {vol.totalEvents || 0}
                                        </td>
                                        <td className="badges-cell">
                                            {vol.badges?.length > 0 ? (
                                                <div className="mini-badges">
                                                    {vol.badges.slice(0, 3).map(badge => (
                                                        <span key={badge} className="mini-badge" title={badge}>🏆</span>
                                                    ))}
                                                    {vol.badges.length > 3 && <span>+{vol.badges.length - 3}</span>}
                                                </div>
                                            ) : (
                                                <span className="no-badges">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Leaderboard;

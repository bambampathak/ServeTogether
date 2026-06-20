import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VolunteerDashboard from './pages/VolunteerDashboard';
import Profile from './pages/Profile';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Leaderboard from './pages/Leaderboard';
import Certificates from './pages/Certificates';
import AdminDashboard from './pages/AdminDashboard';
import AdminEvents from './pages/AdminEvents';
import AdminVolunteers from './pages/AdminVolunteers';
import AdminReports from './pages/AdminReports';
import AdminAttendance from './pages/AdminAttendance';
import ResetPassword from './pages/ResetPassword';
import Footer from './components/Footer';
import { FiHeart, FiUsers } from 'react-icons/fi';

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    if (!adminOnly && user.role === 'admin') {
        return <Navigate to="/admin" />;
    }

    return children;
}

function App() {
    const { user } = useAuth();

    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
                    <Route path="/signup" element={!user ? <Signup /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/dashboard" element={<ProtectedRoute><VolunteerDashboard /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
                    <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/events" element={<ProtectedRoute adminOnly><AdminEvents /></ProtectedRoute>} />
                    <Route path="/admin/volunteers" element={<ProtectedRoute adminOnly><AdminVolunteers /></ProtectedRoute>} />
                    <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>} />
                    <Route path="/admin/attendance" element={<ProtectedRoute adminOnly><AdminAttendance /></ProtectedRoute>} />
                </Routes>
            </main>
            <Footer />

            {/* Floating Donate/Volunteer Button */}
            <div className="floating-btn-container">
                <a href="https://nayepankh.org/donate" target="_blank" rel="noopener noreferrer" className="floating-btn floating-btn-donate">
                    <FiHeart /> Donate
                </a>
                {!user && (
                    <a href="/signup" className="floating-btn floating-btn-volunteer">
                        <FiUsers /> Volunteer
                    </a>
                )}
            </div>
        </div>
    );
}

export default App;

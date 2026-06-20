import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Verifying login status...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    if (!adminOnly && user.role === 'admin') {
        return <Navigate to="/admin" replace />;
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
                    
                    <Route 
                        path="/login" 
                        element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />} 
                    />
                    
                    <Route 
                        path="/signup" 
                        element={!user ? <Signup /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />} 
                    />
                    
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <VolunteerDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    
                    <Route 
                        path="/admin" 
                        element={
                            <ProtectedRoute adminOnly>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <Footer />
            
            {/* Global toast notification system */}
            <Toaster 
                position="top-center" 
                toastOptions={{
                    style: {
                        background: '#161c2d',
                        color: '#f3f4f6',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        fontFamily: 'Poppins, sans-serif'
                    }
                }} 
            />
        </div>
    );
}

export default App;

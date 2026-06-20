import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load logged in user info on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            setLoading(true);
            const res = await authAPI.getMe();
            setUser(res.data.user);
        } catch (err) {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const res = await authAPI.login({ email, password });
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            return res.data.user;
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Login failed';
            setError(errMsg);
            throw new Error(errMsg);
        }
    };

    const signup = async (userData) => {
        try {
            setError(null);
            const res = await authAPI.register(userData);
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            return res.data.user;
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Registration failed';
            setError(errMsg);
            throw new Error(errMsg);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        logout,
        loadUser,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;

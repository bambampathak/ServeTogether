const jwt = require('jsonwebtoken');
const Volunteer = require('../models/Volunteer');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. Please login.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await Volunteer.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please login again.'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token. Please login again.'
        });
    }
};

// Admin only middleware
exports.adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// Volunteer only middleware
exports.volunteerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'volunteer') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Volunteer privileges required.'
        });
    }
};

// Approved volunteer middleware
exports.approvedOnly = (req, res, next) => {
    if (req.user && (req.user.status === 'approved' || req.user.status === 'active' || req.user.role === 'admin')) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Your account is not yet approved. Please wait for admin approval.'
        });
    }
};

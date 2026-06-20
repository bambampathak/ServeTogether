const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Volunteer = require('../models/Volunteer');
const { protect } = require('../middleware/auth');

// Helper to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'nayepankh_123', {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register a new volunteer
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, age, skills, availability } = req.body;

        // Check if volunteer exists
        const userExists = await Volunteer.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'A user with this email already exists'
            });
        }

        // Set role - automatically make email containing 'admin' an admin for ease of testing
        let role = 'volunteer';
        if (email && (email.toLowerCase().includes('admin') || email.toLowerCase().endsWith('@nayepankh.org') && email.toLowerCase().includes('admin'))) {
            role = 'admin';
        }

        // Create volunteer
        const volunteer = await Volunteer.create({
            name,
            email,
            password,
            phone,
            age,
            skills: skills || [],
            availability: availability || [],
            role,
            status: role === 'admin' ? 'approved' : 'pending' // Admins are automatically approved
        });

        // Generate token
        const token = generateToken(volunteer._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: volunteer._id,
                name: volunteer.name,
                email: volunteer.email,
                role: volunteer.role,
                status: volunteer.status
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
});

// @desc    Login volunteer
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user (include password in response)
        const user = await Volunteer.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await Volunteer.findById(req.user.id);
        res.json({
            success: true,
            user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// @desc    Download Volunteer Certificate
// @route   GET /api/auth/certificate
// @access  Private
router.get('/certificate', protect, async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.user.id);
        if (!volunteer) {
            return res.status(404).json({ success: false, message: 'Volunteer not found' });
        }
        if (volunteer.status !== 'approved') {
            return res.status(400).json({ success: false, message: 'Certificate is only available for approved volunteers' });
        }
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=volunteer_certificate.pdf`);

        const { generateVolunteerCertificate } = require('../utils/report');
        generateVolunteerCertificate(volunteer, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error generating certificate' });
    }
});

module.exports = router;


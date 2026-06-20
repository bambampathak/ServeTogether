const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Volunteer = require('../models/Volunteer');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

// Helper to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'nayepankh_123', {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register a new volunteer or admin
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, age, skills, availability } = req.body;

        // Check if volunteer or admin exists
        const volunteerExists = await Volunteer.findOne({ email });
        const adminExists = await Admin.findOne({ email });

        if (volunteerExists || adminExists) {
            return res.status(400).json({
                success: false,
                message: 'A user with this email already exists'
            });
        }

        // Set role - require adminCode if registering as admin, otherwise fallback to email check or default to volunteer
        let role = 'volunteer';
        if (req.body.role === 'admin') {
            const adminCode = req.body.adminCode;
            const expectedCode = process.env.ADMIN_REGISTRATION_CODE || 'NayePankhAdmin2026';
            if (adminCode === expectedCode) {
                role = 'admin';
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid admin registration access code'
                });
            }
        } else if (email && (email.toLowerCase().includes('admin') || email.toLowerCase().endsWith('@nayepankh.org') && email.toLowerCase().includes('admin'))) {
            role = 'admin';
        }

        if (role === 'admin') {
            // Create admin
            const admin = await Admin.create({
                name,
                email,
                password,
                phone,
                role
            });

            // Generate token
            const token = generateToken(admin._id);

            return res.status(201).json({
                success: true,
                token,
                user: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    status: 'active'
                }
            });
        } else {
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
                status: 'pending' // Volunteers start as pending
            });

            // Generate token
            const token = generateToken(volunteer._id);

            return res.status(201).json({
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
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
});

// @desc    Login volunteer or admin
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

        // Check for user in Volunteer first
        let user = await Volunteer.findOne({ email }).select('+password');
        let isVolunteer = true;

        if (!user) {
            user = await Admin.findOne({ email }).select('+password');
            isVolunteer = false;
        }

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
                status: isVolunteer ? user.status : 'active'
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
        let user = await Volunteer.findById(req.user.id);
        if (!user) {
            user = await Admin.findById(req.user.id);
        }
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


const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Volunteer = require('../models/Volunteer');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { sendRegistrationEmail } = require('../utils/emailSender');

// @route   POST /api/auth/register
// @desc    Register a new volunteer
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const {
            name, email, password, phone, age, gender, city, address,
            skills, otherSkills, availability, experience, motivation,
            emergencyContact
        } = req.body;

        // Check if email already exists
        const existingVolunteer = await Volunteer.findOne({ email });
        if (existingVolunteer) {
            return res.status(400).json({
                success: false,
                message: 'Email is already registered. Please login or use a different email.'
            });
        }

        // Create volunteer
        const volunteer = await Volunteer.create({
            name, email, password, phone, age, gender, city, address,
            skills, otherSkills, availability, experience, motivation,
            emergencyContact
        });

        // Generate JWT token
        const token = volunteer.getSignedJwtToken();

        // Create notification
        await Notification.create({
            recipient: volunteer._id,
            type: 'registration_success',
            title: 'Registration Successful',
            message: `Welcome ${name}! Your registration with Nayepankh Foundation is pending approval. We'll notify you once it's approved.`,
            sentVia: 'in-app'
        });

        // Send registration email
        try {
            await sendRegistrationEmail(volunteer);
        } catch (emailError) {
            console.error('Registration email failed:', emailError.message);
        }

        res.status(201).json({
            success: true,
            token,
            volunteer: {
                id: volunteer._id,
                name: volunteer.name,
                email: volunteer.email,
                role: volunteer.role,
                status: volunteer.status
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login volunteer/admin
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find volunteer by email (include password)
        const volunteer = await Volunteer.findOne({ email }).select('+password');
        if (!volunteer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. No account found with this email.'
            });
        }

        // Compare password
        const isMatch = await volunteer.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Incorrect password.'
            });
        }

        // Generate JWT token
        const token = volunteer.getSignedJwtToken();

        res.json({
            success: true,
            token,
            volunteer: {
                id: volunteer._id,
                name: volunteer.name,
                email: volunteer.email,
                role: volunteer.role,
                status: volunteer.status,
                profilePhoto: volunteer.profilePhoto
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in volunteer
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.user._id)
            .populate('certificates')
            .populate('registeredEvents');

        res.json({
            success: true,
            volunteer
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/auth/updatepassword
// @desc    Update password
// @access  Private
router.put('/updatepassword', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const volunteer = await Volunteer.findById(req.user._id).select('+password');

        // Check current password
        const isMatch = await volunteer.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        volunteer.password = newPassword;
        await volunteer.save();

        const token = volunteer.getSignedJwtToken();

        res.json({
            success: true,
            token,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/auth/forgotpassword
// @desc    Forgot password - generate reset token
// @access  Public
router.post('/forgotpassword', async (req, res) => {
    try {
        const { email } = req.body;

        const volunteer = await Volunteer.findOne({ email });
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { id: volunteer._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        volunteer.resetPasswordToken = resetToken;
        volunteer.resetPasswordExpire = Date.now() + 3600000; // 1 hour
        await volunteer.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // Send reset email
        const { sendEmail } = require('../utils/emailSender');
        await sendEmail({
            to: volunteer.email,
            subject: 'ServeTogether - Password Reset',
            html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #2E86AB;">Password Reset Request</h2>
          <p>Hello ${volunteer.name},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="background: #2E86AB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
        });

        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/auth/resetpassword/:resettoken
// @desc    Reset password using token
// @access  Public
router.put('/resetpassword/:resettoken', async (req, res) => {
    try {
        const { newPassword } = req.body;

        // Verify reset token
        const decoded = jwt.verify(req.params.resettoken, process.env.JWT_SECRET);

        const volunteer = await Volunteer.findOne({
            _id: decoded.id,
            resetPasswordToken: req.params.resettoken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!volunteer) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        volunteer.password = newPassword;
        volunteer.resetPasswordToken = undefined;
        volunteer.resetPasswordExpire = undefined;
        await volunteer.save();

        const token = volunteer.getSignedJwtToken();

        res.json({
            success: true,
            token,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Invalid or expired reset token'
        });
    }
});

module.exports = router;

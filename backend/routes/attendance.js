const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const Volunteer = require('../models/Volunteer');
const Notification = require('../models/Notification');
const { protect, adminOnly, approvedOnly } = require('../middleware/auth');
const { verifyQRCodeData } = require('../utils/qrCodeGenerator');

// @route   POST /api/attendance/checkin
// @desc    Check in to an event (QR or manual)
// @access  Private/Approved
router.post('/checkin', protect, approvedOnly, async (req, res) => {
    try {
        const { eventId, method = 'manual', qrData } = req.body;

        // If QR scan, verify the data
        if (method === 'qr' && qrData) {
            const verification = verifyQRCodeData(qrData);
            if (!verification.valid) {
                return res.status(400).json({
                    success: false,
                    message: verification.message
                });
            }
            // Use the event ID from QR data
            req.body.eventId = verification.data.eventId;
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if volunteer is registered for this event
        const isRegistered = event.registeredVolunteers.some(
            rv => rv.volunteer.toString() === req.user._id.toString() && rv.status !== 'cancelled'
        );

        if (!isRegistered) {
            return res.status(400).json({
                success: false,
                message: 'You are not registered for this event. Please register first.'
            });
        }

        // Check if already checked in
        const existingAttendance = await Attendance.findOne({
            volunteer: req.user._id,
            event: eventId
        });

        if (existingAttendance && existingAttendance.status === 'checked-in') {
            return res.status(400).json({
                success: false,
                message: 'You are already checked in for this event.'
            });
        }

        // Create or update attendance record
        let attendance;
        if (existingAttendance) {
            existingAttendance.checkInTime = new Date();
            existingAttendance.checkInMethod = method;
            existingAttendance.status = 'checked-in';
            attendance = await existingAttendance.save();
        } else {
            attendance = await Attendance.create({
                volunteer: req.user._id,
                event: eventId,
                checkInTime: new Date(),
                checkInMethod: method,
                status: 'checked-in'
            });
        }

        res.json({
            success: true,
            message: 'Successfully checked in!',
            attendance
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/attendance/checkout
// @desc    Check out from an event (QR or manual)
// @access  Private/Approved
router.post('/checkout', protect, approvedOnly, async (req, res) => {
    try {
        const { eventId, method = 'manual', qrData } = req.body;

        // If QR scan, verify the data
        if (method === 'qr' && qrData) {
            const verification = verifyQRCodeData(qrData);
            if (!verification.valid) {
                return res.status(400).json({
                    success: false,
                    message: verification.message
                });
            }
        }

        const attendance = await Attendance.findOne({
            volunteer: req.user._id,
            event: eventId,
            status: 'checked-in'
        });

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: 'You are not checked in for this event. Please check in first.'
            });
        }

        // Check out
        attendance.checkOutTime = new Date();
        attendance.checkOutMethod = method;
        attendance.status = 'checked-out';
        attendance.calculateHours();
        await attendance.save();

        // Update volunteer total hours
        const volunteer = await Volunteer.findById(req.user._id);
        volunteer.totalHours += attendance.hoursVolunteered;
        volunteer.totalEvents += 1;

        // Add points (10 points per hour)
        volunteer.points += Math.floor(attendance.hoursVolunteered * 10);

        // Check for badge achievements
        if (volunteer.totalEvents >= 5 && !volunteer.badges.find(b => b.name === '5 Events')) {
            volunteer.badges.push({ name: '5 Events', icon: '🌟' });
        }
        if (volunteer.totalEvents >= 10 && !volunteer.badges.find(b => b.name === '10 Events')) {
            volunteer.badges.push({ name: '10 Events', icon: '🏆' });
        }
        if (volunteer.totalHours >= 20 && !volunteer.badges.find(b => b.name === '20 Hours')) {
            volunteer.badges.push({ name: '20 Hours', icon: '⏰' });
        }
        if (volunteer.totalHours >= 50 && !volunteer.badges.find(b => b.name === '50 Hours')) {
            volunteer.badges.push({ name: '50 Hours', icon: '💪' });
        }
        if (volunteer.totalHours >= 100 && !volunteer.badges.find(b => b.name === '100 Hours')) {
            volunteer.badges.push({ name: '100 Hours', icon: '🦁' });
        }

        await volunteer.save();

        // Create notification
        await Notification.create({
            recipient: req.user._id,
            type: 'thank_you',
            title: 'Thank You!',
            message: `Thank you for volunteering at the event! You contributed ${attendance.hoursVolunteered} hours. Your certificate will be available soon.`,
            relatedEvent: eventId,
            sentVia: 'in-app'
        });

        res.json({
            success: true,
            message: 'Successfully checked out!',
            attendance,
            hoursVolunteered: attendance.hoursVolunteered,
            totalHours: volunteer.totalHours,
            totalEvents: volunteer.totalEvents,
            points: volunteer.points,
            badges: volunteer.badges
        });
    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/attendance/event/:eventId
// @desc    Get attendance records for an event
// @access  Private/Admin
router.get('/event/:eventId', protect, adminOnly, async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find({ event: req.params.eventId })
            .populate('volunteer', 'name email phone profilePhoto')
            .populate('event', 'title date')
            .sort({ checkInTime: -1 });

        res.json({
            success: true,
            count: attendanceRecords.length,
            attendance: attendanceRecords
        });
    } catch (error) {
        console.error('Get event attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/attendance/my
// @desc    Get volunteer's own attendance records
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find({ volunteer: req.user._id })
            .populate('event', 'title date category location')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: attendanceRecords.length,
            attendance: attendanceRecords
        });
    } catch (error) {
        console.error('Get my attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/attendance/admin/checkin
// @desc    Admin manual check-in for a volunteer
// @access  Private/Admin
router.post('/admin/checkin', protect, adminOnly, async (req, res) => {
    try {
        const { volunteerId, eventId } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const volunteer = await Volunteer.findById(volunteerId);
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        // Check if already checked in
        const existingAttendance = await Attendance.findOne({
            volunteer: volunteerId,
            event: eventId
        });

        if (existingAttendance && existingAttendance.status === 'checked-in') {
            return res.status(400).json({
                success: false,
                message: 'Volunteer is already checked in for this event.'
            });
        }

        let attendance;
        if (existingAttendance) {
            existingAttendance.checkInTime = new Date();
            existingAttendance.checkInMethod = 'manual';
            existingAttendance.status = 'checked-in';
            existingAttendance.verifiedBy = req.user._id;
            attendance = await existingAttendance.save();
        } else {
            attendance = await Attendance.create({
                volunteer: volunteerId,
                event: eventId,
                checkInTime: new Date(),
                checkInMethod: 'manual',
                status: 'checked-in',
                verifiedBy: req.user._id
            });
        }

        res.json({
            success: true,
            message: 'Volunteer checked in successfully',
            attendance
        });
    } catch (error) {
        console.error('Admin check-in error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/attendance/admin/checkout
// @desc    Admin manual check-out for a volunteer
// @access  Private/Admin
router.post('/admin/checkout', protect, adminOnly, async (req, res) => {
    try {
        const { volunteerId, eventId } = req.body;

        const attendance = await Attendance.findOne({
            volunteer: volunteerId,
            event: eventId,
            status: 'checked-in'
        });

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: 'Volunteer is not checked in for this event.'
            });
        }

        attendance.checkOutTime = new Date();
        attendance.checkOutMethod = 'manual';
        attendance.status = 'checked-out';
        attendance.verifiedBy = req.user._id;
        attendance.calculateHours();
        await attendance.save();

        // Update volunteer stats
        const volunteer = await Volunteer.findById(volunteerId);
        volunteer.totalHours += attendance.hoursVolunteered;
        volunteer.totalEvents += 1;
        volunteer.points += Math.floor(attendance.hoursVolunteered * 10);
        await volunteer.save();

        res.json({
            success: true,
            message: 'Volunteer checked out successfully',
            attendance,
            hoursVolunteered: attendance.hoursVolunteered
        });
    } catch (error) {
        console.error('Admin check-out error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;

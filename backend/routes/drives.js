const express = require('express');
const router = express.Router();
const Drive = require('../models/Drive');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/drives
// @desc    Get all drives
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const drives = await Drive.find().sort({ date: 1 }).populate('volunteers', 'name email phone status');
        res.json({
            success: true,
            count: drives.length,
            drives
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
});

// @route   POST /api/drives
// @desc    Create a new volunteering drive
// @access  Private/Admin
router.post('/', [protect, authorize('admin')], async (req, res) => {
    try {
        const { title, description, date, location, skillsRequired, maxVolunteers, status, organizer } = req.body;

        if (!title || !description || !date || !location || !maxVolunteers) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, date, location, and max volunteers'
            });
        }

        const drive = await Drive.create({
            title,
            description,
            date,
            location,
            skillsRequired: skillsRequired || [],
            maxVolunteers,
            status: status || 'upcoming',
            organizer: organizer || 'NayePankh Foundation'
        });

        res.status(201).json({
            success: true,
            drive
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
});

// @route   PUT /api/drives/:id
// @desc    Update a volunteering drive
// @access  Private/Admin
router.put('/:id', [protect, authorize('admin')], async (req, res) => {
    try {
        const drive = await Drive.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!drive) {
            return res.status(404).json({
                success: false,
                message: 'Drive not found'
            });
        }

        res.json({
            success: true,
            drive
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
});

// @route   DELETE /api/drives/:id
// @desc    Delete a volunteering drive
// @access  Private/Admin
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
    try {
        const drive = await Drive.findByIdAndDelete(req.params.id);

        if (!drive) {
            return res.status(404).json({
                success: false,
                message: 'Drive not found'
            });
        }

        res.json({
            success: true,
            message: 'Drive deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
});

// @route   POST /api/drives/:id/register
// @desc    Register current user for a drive
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
    try {
        const drive = await Drive.findById(req.params.id);

        if (!drive) {
            return res.status(404).json({
                success: false,
                message: 'Drive not found'
            });
        }

        if (drive.status === 'completed' || drive.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'This drive has already ended or been cancelled'
            });
        }

        // Only approved volunteers can register
        if (req.user.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Only approved volunteers can register for drives'
            });
        }

        // Check if already registered
        if (drive.volunteers.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this drive'
            });
        }

        // Check if drive is full
        if (drive.volunteers.length >= drive.maxVolunteers) {
            return res.status(400).json({
                success: false,
                message: 'This drive is already full'
            });
        }

        drive.volunteers.push(req.user._id);
        await drive.save();

        res.json({
            success: true,
            message: 'Successfully registered for the drive',
            drive
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
});

// @route   POST /api/drives/:id/unregister
// @desc    Unregister current user from a drive
// @access  Private
router.post('/:id/unregister', protect, async (req, res) => {
    try {
        const drive = await Drive.findById(req.params.id);

        if (!drive) {
            return res.status(404).json({
                success: false,
                message: 'Drive not found'
            });
        }

        // Find and remove volunteer ID
        const index = drive.volunteers.indexOf(req.user._id);
        if (index === -1) {
            return res.status(400).json({
                success: false,
                message: 'You are not registered for this drive'
            });
        }

        drive.volunteers.splice(index, 1);
        await drive.save();

        res.json({
            success: true,
            message: 'Successfully unregistered from the drive',
            drive
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
});

module.exports = router;

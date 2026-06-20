const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const { protect, authorize } = require('../middleware/auth');
const { generateCSVReport, generatePDFReport } = require('../utils/report');

// Apply protection & admin role check to all routes
router.use(protect);
router.use(authorize('admin'));

// @desc    Get all volunteers with filters and search
// @route   GET /api/admin/volunteers
// @access  Private/Admin
router.get('/volunteers', async (req, res) => {
    try {
        const { search, status, skill } = req.query;

        // Build query
        const queryObj = { role: 'volunteer' };

        if (search) {
            queryObj.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            queryObj.status = status;
        }

        if (skill) {
            queryObj.skills = { $in: [skill] };
        }

        const volunteers = await Volunteer.find(queryObj).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: volunteers.length,
            volunteers
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
});

// @desc    Approve or reject a volunteer
// @route   PATCH /api/admin/volunteers/:id/status
// @access  Private/Admin
router.patch('/volunteers/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value. Must be pending, approved, or rejected.'
            });
        }

        const volunteer = await Volunteer.findById(req.params.id);

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        volunteer.status = status;
        await volunteer.save();

        res.json({
            success: true,
            volunteer
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
});

// @desc    Export volunteer report as CSV
// @route   GET /api/admin/reports/csv
// @access  Private/Admin
router.get('/reports/csv', async (req, res) => {
    try {
        const { status, skill } = req.query;
        const queryObj = { role: 'volunteer' };

        if (status) queryObj.status = status;
        if (skill) queryObj.skills = { $in: [skill] };

        const volunteers = await Volunteer.find(queryObj).sort({ name: 1 });
        const csvContent = generateCSVReport(volunteers);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=volunteers_report.csv');
        res.status(200).send(csvContent);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }
});

// @desc    Get PDF overall report of volunteers
// @route   GET /api/admin/reports/pdf
// @access  Private/Admin
router.get('/reports/pdf', async (req, res) => {
    try {
        const volunteers = await Volunteer.find({ role: 'volunteer' });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=volunteer_demographics.pdf');

        generatePDFReport(volunteers, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error generating PDF report'
        });
    }
});

module.exports = router;

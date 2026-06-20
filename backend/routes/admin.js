const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');
const { sendApprovalEmail } = require('../utils/emailSender');
const { exportVolunteersCSV, exportEventsCSV, exportAttendanceCSV } = require('../utils/csvExport');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', protect, adminOnly, async (req, res) => {
    try {
        const totalVolunteers = await Volunteer.countDocuments();
        const activeVolunteers = await Volunteer.countDocuments({ status: { $in: ['approved', 'active'] } });
        const pendingVolunteers = await Volunteer.countDocuments({ status: 'pending' });
        const rejectedVolunteers = await Volunteer.countDocuments({ status: 'rejected' });

        const totalEvents = await Event.countDocuments();
        const upcomingEvents = await Event.countDocuments({ status: 'upcoming' });
        const ongoingEvents = await Event.countDocuments({ status: 'ongoing' });
        const completedEvents = await Event.countDocuments({ status: 'completed' });

        const totalHours = await Volunteer.aggregate([
            { $group: { _id: null, total: { $sum: '$totalHours' } } }
        ]);

        const genderDistribution = await Volunteer.aggregate([
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);

        const ageDistribution = await Volunteer.aggregate([
            {
                $bucket: {
                    groupBy: '$age',
                    boundaries: [16, 20, 25, 30, 35, 40, 50, 60, 100],
                    default: '60+',
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        const skillsDistribution = await Volunteer.aggregate([
            { $unwind: '$skills' },
            { $group: { _id: '$skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const cityDistribution = await Volunteer.aggregate([
            { $group: { _id: '$city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const recentEvents = await Event.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('organizer', 'name');

        const recentVolunteers = await Volunteer.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            stats: {
                volunteers: {
                    total: totalVolunteers,
                    active: activeVolunteers,
                    pending: pendingVolunteers,
                    rejected: rejectedVolunteers
                },
                events: {
                    total: totalEvents,
                    upcoming: upcomingEvents,
                    ongoing: ongoingEvents,
                    completed: completedEvents
                },
                totalHours: totalHours.length > 0 ? totalHours[0].total : 0,
                genderDistribution,
                ageDistribution,
                skillsDistribution,
                cityDistribution,
                recentEvents,
                recentVolunteers
            }
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/admin/volunteers/:id/approve
// @desc    Approve a volunteer
// @access  Private/Admin
router.put('/volunteers/:id/approve', protect, adminOnly, async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        volunteer.status = 'approved';
        await volunteer.save();

        // Create notification
        await Notification.create({
            recipient: volunteer._id,
            type: 'approval_status',
            title: 'Registration Approved!',
            message: 'Your volunteer registration has been approved! You can now browse and register for events.',
            actionUrl: '/events',
            sentVia: 'in-app'
        });

        // Send approval email
        try {
            await sendApprovalEmail(volunteer, 'approved');
        } catch (emailError) {
            console.error('Approval email failed:', emailError.message);
        }

        res.json({
            success: true,
            message: 'Volunteer approved successfully',
            volunteer
        });
    } catch (error) {
        console.error('Approve volunteer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/admin/volunteers/:id/reject
// @desc    Reject a volunteer
// @access  Private/Admin
router.put('/volunteers/:id/reject', protect, adminOnly, async (req, res) => {
    try {
        const { reason } = req.body;

        const volunteer = await Volunteer.findById(req.params.id);

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        volunteer.status = 'rejected';
        await volunteer.save();

        // Create notification
        await Notification.create({
            recipient: volunteer._id,
            type: 'approval_status',
            title: 'Registration Rejected',
            message: reason || 'Your volunteer registration has been rejected. Please contact us for more information.',
            sentVia: 'in-app'
        });

        // Send rejection email
        try {
            await sendApprovalEmail(volunteer, 'rejected');
        } catch (emailError) {
            console.error('Rejection email failed:', emailError.message);
        }

        res.json({
            success: true,
            message: 'Volunteer rejected',
            volunteer
        });
    } catch (error) {
        console.error('Reject volunteer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/admin/volunteers/:id/status
// @desc    Update volunteer status (active/inactive)
// @access  Private/Admin
router.put('/volunteers/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;

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
            message: `Volunteer status updated to ${status}`,
            volunteer
        });
    } catch (error) {
        console.error('Update volunteer status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/admin/volunteers/:id
// @desc    Delete a volunteer
// @access  Private/Admin
router.delete('/volunteers/:id', protect, adminOnly, async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        await volunteer.remove();

        res.json({
            success: true,
            message: 'Volunteer deleted successfully'
        });
    } catch (error) {
        console.error('Delete volunteer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/volunteers/pending
// @desc    Get pending volunteer registrations
// @access  Private/Admin
router.get('/volunteers/pending', protect, adminOnly, async (req, res) => {
    try {
        const pendingVolunteers = await Volunteer.find({ status: 'pending' })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: pendingVolunteers.length,
            volunteers: pendingVolunteers
        });
    } catch (error) {
        console.error('Get pending volunteers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/export/volunteers
// @desc    Export volunteers to CSV
// @access  Private/Admin
router.get('/export/volunteers', protect, adminOnly, async (req, res) => {
    try {
        const { status, skills, city } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (skills) filter.skills = { $in: skills.split(',') };
        if (city) filter.city = { $regex: city, $options: 'i' };

        const volunteers = await Volunteer.find(filter).sort({ createdAt: -1 });

        const csv = exportVolunteersCSV(volunteers);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=volunteers_export.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export volunteers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/export/events
// @desc    Export events to CSV
// @access  Private/Admin
router.get('/export/events', protect, adminOnly, async (req, res) => {
    try {
        const { status, category } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;

        const events = await Event.find(filter)
            .populate('organizer', 'name')
            .sort({ createdAt: -1 });

        const csv = exportEventsCSV(events);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=events_export.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/export/attendance
// @desc    Export attendance to CSV
// @access  Private/Admin
router.get('/export/attendance', protect, adminOnly, async (req, res) => {
    try {
        const { eventId } = req.query;

        const filter = {};
        if (eventId) filter.event = eventId;

        const attendanceRecords = await Attendance.find(filter)
            .populate('volunteer', 'name email')
            .populate('event', 'title date')
            .sort({ createdAt: -1 });

        const csv = exportAttendanceCSV(attendanceRecords);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance_export.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/reports
// @desc    Get comprehensive reports
// @access  Private/Admin
router.get('/reports', protect, adminOnly, async (req, res) => {
    try {
        const { period = 'all' } = req.query;

        let dateFilter = {};
        if (period === 'monthly') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: startOfMonth } };
        } else if (period === 'weekly') {
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: startOfWeek } };
        }

        // Volunteer stats
        const volunteerStats = {
            total: await Volunteer.countDocuments(),
            active: await Volunteer.countDocuments({ status: { $in: ['approved', 'active'] } }),
            newThisPeriod: await Volunteer.countDocuments(dateFilter)
        };

        // Event stats
        const eventStats = {
            total: await Event.countDocuments(),
            upcoming: await Event.countDocuments({ status: 'upcoming' }),
            completed: await Event.countDocuments({ status: 'completed' }),
            newThisPeriod: await Event.countDocuments(dateFilter)
        };

        // Hours stats
        const hoursStats = await Attendance.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalHours: { $sum: '$hoursVolunteered' },
                    avgHours: { $avg: '$hoursVolunteered' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Participation stats
        const participationStats = await Event.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    avgVolunteers: { $avg: '$currentVolunteers' },
                    totalVolunteers: { $sum: '$currentVolunteers' },
                    totalCapacity: { $sum: '$maxVolunteers' }
                }
            }
        ]);

        // Top volunteers
        const topVolunteers = await Volunteer.find({ status: { $in: ['approved', 'active'] } })
            .select('name totalHours totalEvents points city')
            .sort({ points: -1 })
            .limit(10);

        res.json({
            success: true,
            reports: {
                volunteerStats,
                eventStats,
                hoursStats: hoursStats.length > 0 ? hoursStats[0] : { totalHours: 0, avgHours: 0, count: 0 },
                participationStats: participationStats.length > 0 ? participationStats[0] : { avgVolunteers: 0, totalVolunteers: 0, totalCapacity: 0 },
                topVolunteers
            }
        });
    } catch (error) {
        console.error('Reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/admin/create-admin
// @desc    Create an admin account (first admin only, or existing admin)
// @access  Private/Admin
router.post('/create-admin', protect, adminOnly, async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const existingAdmin = await Volunteer.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const admin = await Volunteer.create({
            name, email, password, phone,
            role: 'admin',
            status: 'approved',
            age: 25,
            gender: 'Prefer not to say',
            city: 'Admin'
        });

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

module.exports = router;

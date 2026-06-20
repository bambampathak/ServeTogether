const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const Volunteer = require('../models/Volunteer');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');
const { generateCertificate } = require('../utils/certificateGenerator');
const { sendCertificateEmail } = require('../utils/emailSender');
const path = require('path');

// @route   GET /api/certificates
// @desc    Get volunteer's certificates
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const certificates = await Certificate.find({ volunteer: req.user._id })
            .populate('event', 'title date category')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: certificates.length,
            certificates
        });
    } catch (error) {
        console.error('Get certificates error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/certificates/:id
// @desc    Get single certificate
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate('event', 'title date category location')
            .populate('volunteer', 'name email');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        // Check if the certificate belongs to the volunteer or is admin
        if (certificate.volunteer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this certificate'
            });
        }

        res.json({
            success: true,
            certificate
        });
    } catch (error) {
        console.error('Get certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/certificates/:id/download
// @desc    Download certificate PDF
// @access  Private
router.get('/:id/download', protect, async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        // Check ownership or admin
        if (certificate.volunteer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this certificate'
            });
        }

        const filePath = path.join(__dirname, '..', 'uploads', 'certificates', `${certificate.certificateId}.pdf`);

        if (!require('fs').existsSync(filePath)) {
            // Generate certificate if file doesn't exist
            await generateCertificate({
                volunteerName: certificate.volunteerName,
                eventName: certificate.eventName,
                eventDate: certificate.eventDate,
                hoursCompleted: certificate.hoursCompleted,
                certificateId: certificate.certificateId,
                issuedBy: certificate.issuedBy
            });
        }

        res.download(filePath, `${certificate.certificateId}.pdf`);
    } catch (error) {
        console.error('Download certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/certificates/generate/:eventId/:volunteerId
// @desc    Generate certificate for a volunteer (Admin only)
// @access  Private/Admin
router.post('/generate/:eventId/:volunteerId', protect, adminOnly, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const volunteer = await Volunteer.findById(req.params.volunteerId);
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        // Check if certificate already exists
        const existingCert = await Certificate.findOne({
            volunteer: volunteer._id,
            event: event._id
        });

        if (existingCert) {
            return res.status(400).json({
                success: false,
                message: 'Certificate already exists for this volunteer and event'
            });
        }

        // Get attendance hours
        const attendance = await Attendance.findOne({
            volunteer: volunteer._id,
            event: event._id,
            status: 'checked-out'
        });

        const hoursCompleted = attendance ? attendance.hoursVolunteered : 0;

        // Create certificate record
        const certificate = await Certificate.create({
            volunteer: volunteer._id,
            event: event._id,
            volunteerName: volunteer.name,
            eventName: event.title,
            eventDate: event.date,
            hoursCompleted,
            issuedBy: 'Nayepankh Foundation',
            status: 'pending'
        });

        // Generate PDF
        const filePath = await generateCertificate({
            volunteerName: volunteer.name,
            eventName: event.title,
            eventDate: event.date,
            hoursCompleted,
            certificateId: certificate.certificateId,
            issuedBy: 'Nayepankh Foundation'
        });

        certificate.pdfUrl = filePath;
        certificate.status = 'generated';
        await certificate.save();

        // Add certificate to volunteer's list
        volunteer.certificates.push(certificate._id);
        await volunteer.save();

        // Create notification
        await Notification.create({
            recipient: volunteer._id,
            type: 'certificate_available',
            title: 'Certificate Available!',
            message: `Your certificate for "${event.title}" is now available. Download it from your dashboard.`,
            relatedEvent: event._id,
            relatedCertificate: certificate._id,
            actionUrl: '/certificates',
            sentVia: 'in-app'
        });

        // Send certificate email
        try {
            await sendCertificateEmail(volunteer, certificate);
        } catch (emailError) {
            console.error('Certificate email failed:', emailError.message);
        }

        res.json({
            success: true,
            message: 'Certificate generated successfully',
            certificate
        });
    } catch (error) {
        console.error('Generate certificate error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// @route   POST /api/certificates/generate-bulk/:eventId
// @desc    Generate certificates for all volunteers in an event (Admin only)
// @access  Private/Admin
router.post('/generate-bulk/:eventId', protect, adminOnly, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Get all checked-out attendance records
        const attendanceRecords = await Attendance.find({
            event: event._id,
            status: 'checked-out'
        }).populate('volunteer', 'name email');

        const certificates = [];

        for (const attendance of attendanceRecords) {
            // Check if certificate already exists
            const existingCert = await Certificate.findOne({
                volunteer: attendance.volunteer._id,
                event: event._id
            });

            if (existingCert) continue;

            const volunteer = attendance.volunteer;

            // Create certificate
            const certificate = await Certificate.create({
                volunteer: volunteer._id,
                event: event._id,
                volunteerName: volunteer.name,
                eventName: event.title,
                eventDate: event.date,
                hoursCompleted: attendance.hoursVolunteered,
                issuedBy: 'Nayepankh Foundation',
                status: 'pending'
            });

            // Generate PDF
            const filePath = await generateCertificate({
                volunteerName: volunteer.name,
                eventName: event.title,
                eventDate: event.date,
                hoursCompleted: attendance.hoursVolunteered,
                certificateId: certificate.certificateId,
                issuedBy: 'Nayepankh Foundation'
            });

            certificate.pdfUrl = filePath;
            certificate.status = 'generated';
            await certificate.save();

            // Add to volunteer's certificates
            const volunteerDoc = await Volunteer.findById(volunteer._id);
            volunteerDoc.certificates.push(certificate._id);
            await volunteerDoc.save();

            // Create notification
            await Notification.create({
                recipient: volunteer._id,
                type: 'certificate_available',
                title: 'Certificate Available!',
                message: `Your certificate for "${event.title}" is now available.`,
                relatedEvent: event._id,
                relatedCertificate: certificate._id,
                actionUrl: '/certificates',
                sentVia: 'in-app'
            });

            certificates.push(certificate);
        }

        res.json({
            success: true,
            message: `${certificates.length} certificates generated successfully`,
            certificates
        });
    } catch (error) {
        console.error('Bulk certificate generation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

module.exports = router;

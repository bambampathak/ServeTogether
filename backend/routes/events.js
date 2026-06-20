const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Volunteer = require('../models/Volunteer');
const Notification = require('../models/Notification');
const { protect, adminOnly, approvedOnly } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { generateEventQRCode } = require('../utils/qrCodeGenerator');
const { sendEventRegistrationEmail, sendEventReminderEmail } = require('../utils/emailSender');

// @route   GET /api/events
// @desc    Get all events (with filters)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            category, status, city, search, skills,
            page = 1, limit = 10, sortBy = 'date', sortOrder = 'asc'
        } = req.query;

        const filter = {};

        if (category) filter.category = category;
        if (status) filter.status = status;
        if (city) filter.location.city = { $regex: city, $options: 'i' };
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (skills) {
            const skillsArray = skills.split(',');
            filter.requiredSkills = { $in: skillsArray };
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const events = await Event.find(filter)
            .populate('organizer', 'name email profilePhoto')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Event.countDocuments(filter);

        res.json({
            success: true,
            count: events.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            events
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/events/upcoming
// @desc    Get upcoming events
// @access  Public
router.get('/upcoming', async (req, res) => {
    try {
        const events = await Event.find({
            status: 'upcoming',
            date: { $gte: new Date() }
        })
            .populate('organizer', 'name email profilePhoto')
            .sort({ date: 1 })
            .limit(10);

        res.json({
            success: true,
            events
        });
    } catch (error) {
        console.error('Get upcoming events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email profilePhoto')
            .populate('registeredVolunteers.volunteer', 'name email phone profilePhoto skills');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            event
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/events
// @desc    Create a new event (Admin only)
// @access  Private/Admin
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
    try {
        const {
            title, description, category, date, endDate, time, endTime,
            location, maxVolunteers, requiredSkills, notes, isQREnabled
        } = req.body;

        // Parse location if it's a string
        let parsedLocation = location;
        if (typeof location === 'string') {
            parsedLocation = JSON.parse(location);
        }

        // Parse requiredSkills if it's a string
        let parsedSkills = requiredSkills;
        if (typeof requiredSkills === 'string') {
            parsedSkills = JSON.parse(requiredSkills);
        }

        const eventData = {
            title, description, category, date, endDate, time, endTime,
            location: parsedLocation,
            maxVolunteers,
            requiredSkills: parsedSkills || [],
            notes,
            isQREnabled: isQREnabled || false,
            organizer: req.user._id
        };

        // Upload event image if provided
        if (req.file) {
            const result = await uploadToCloudinary(
                req.file.buffer,
                'event-images',
                `event-${Date.now()}`
            );
            eventData.image = result.url;
        }

        // Generate QR code if enabled
        if (isQREnabled) {
            const event = await Event.create(eventData);
            const qrCode = await generateEventQRCode({
                eventId: event._id.toString(),
                type: 'checkin'
            });
            event.qrCode = qrCode;
            await event.save();

            // Notify all approved volunteers about new event
            const volunteers = await Volunteer.find({ status: { $in: ['approved', 'active'] } });
            const notifications = volunteers.map(v => ({
                recipient: v._id,
                type: 'new_event',
                title: 'New Event Available!',
                message: `A new event "${title}" has been created. Check it out and register!`,
                relatedEvent: event._id,
                actionUrl: `/events/${event._id}`,
                sentVia: 'in-app'
            }));
            await Notification.insertMany(notifications);

            return res.status(201).json({
                success: true,
                event
            });
        }

        const event = await Event.create(eventData);

        // Notify all approved volunteers about new event
        const volunteers = await Volunteer.find({ status: { $in: ['approved', 'active'] } });
        const notifications = volunteers.map(v => ({
            recipient: v._id,
            type: 'new_event',
            title: 'New Event Available!',
            message: `A new event "${title}" has been created. Check it out and register!`,
            relatedEvent: event._id,
            actionUrl: `/events/${event._id}`,
            sentVia: 'in-app'
        }));
        await Notification.insertMany(notifications);

        res.status(201).json({
            success: true,
            event
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// @route   PUT /api/events/:id
// @desc    Update event (Admin only)
// @access  Private/Admin
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const updateData = req.body;

        // Parse location and skills if strings
        if (typeof updateData.location === 'string') {
            updateData.location = JSON.parse(updateData.location);
        }
        if (typeof updateData.requiredSkills === 'string') {
            updateData.requiredSkills = JSON.parse(updateData.requiredSkills);
        }

        // Upload new image if provided
        if (req.file) {
            const result = await uploadToCloudinary(
                req.file.buffer,
                'event-images',
                `event-${req.params.id}-${Date.now()}`
            );
            updateData.image = result.url;
        }

        event = await Event.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            event
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete event (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Notify registered volunteers about cancellation
        const registeredVolunteerIds = event.registeredVolunteers
            .filter(rv => rv.status !== 'cancelled')
            .map(rv => rv.volunteer);

        if (registeredVolunteerIds.length > 0) {
            const notifications = registeredVolunteerIds.map(vId => ({
                recipient: vId,
                type: 'general',
                title: 'Event Cancelled',
                message: `The event "${event.title}" has been cancelled. We apologize for any inconvenience.`,
                sentVia: 'in-app'
            }));
            await Notification.insertMany(notifications);
        }

        await event.remove();

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private/Approved
router.post('/:id/register', protect, approvedOnly, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if event is full
        if (event.isFull()) {
            return res.status(400).json({
                success: false,
                message: 'This event is already full. No more volunteers can register.'
            });
        }

        // Check if already registered
        if (event.isVolunteerRegistered(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event.'
            });
        }

        // Register volunteer
        event.registeredVolunteers.push({
            volunteer: req.user._id,
            status: 'registered'
        });
        event.currentVolunteers += 1;
        await event.save();

        // Add event to volunteer's registered events
        const volunteer = await Volunteer.findById(req.user._id);
        volunteer.registeredEvents.push(event._id);
        await volunteer.save();

        // Create notification
        await Notification.create({
            recipient: req.user._id,
            type: 'event_registration',
            title: 'Event Registration Successful',
            message: `You have successfully registered for "${event.title}". Don't forget to attend!`,
            relatedEvent: event._id,
            actionUrl: `/events/${event._id}`,
            sentVia: 'in-app'
        });

        // Send email confirmation
        try {
            await sendEventRegistrationEmail(volunteer, event);
        } catch (emailError) {
            console.error('Event registration email failed:', emailError.message);
        }

        res.json({
            success: true,
            message: 'Successfully registered for the event',
            event
        });
    } catch (error) {
        console.error('Event registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/events/:id/cancel
// @desc    Cancel event registration
// @access  Private
router.post('/:id/cancel', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Find the registration
        const registration = event.registeredVolunteers.find(
            rv => rv.volunteer.toString() === req.user._id.toString() && rv.status !== 'cancelled'
        );

        if (!registration) {
            return res.status(400).json({
                success: false,
                message: 'You are not registered for this event.'
            });
        }

        // Cancel registration
        registration.status = 'cancelled';
        event.currentVolunteers -= 1;
        await event.save();

        // Remove event from volunteer's registered events
        const volunteer = await Volunteer.findById(req.user._id);
        volunteer.registeredEvents = volunteer.registeredEvents.filter(
            eId => eId.toString() !== event._id.toString()
        );
        await volunteer.save();

        // Create notification
        await Notification.create({
            recipient: req.user._id,
            type: 'general',
            title: 'Registration Cancelled',
            message: `You have cancelled your registration for "${event.title}".`,
            relatedEvent: event._id,
            sentVia: 'in-app'
        });

        res.json({
            success: true,
            message: 'Registration cancelled successfully',
            event
        });
    } catch (error) {
        console.error('Cancel registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/events/:id/qrcode
// @desc    Generate QR code for event
// @access  Private/Admin
router.post('/:id/qrcode', protect, adminOnly, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const { type = 'checkin' } = req.body;

        const qrCode = await generateEventQRCode({
            eventId: event._id.toString(),
            type
        });

        event.qrCode = qrCode;
        event.isQREnabled = true;
        await event.save();

        res.json({
            success: true,
            qrCode,
            event
        });
    } catch (error) {
        console.error('QR code generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;

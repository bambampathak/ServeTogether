const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const Volunteer = require('../models/Volunteer');
const { protect, adminOnly, approvedOnly } = require('../middleware/auth');

// @route   POST /api/feedback/volunteer
// @desc    Submit volunteer feedback for an event
// @access  Private/Approved
router.post('/volunteer', protect, approvedOnly, async (req, res) => {
    try {
        const { eventId, rating, comment } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if volunteer was registered for this event
        const isRegistered = event.registeredVolunteers.some(
            rv => rv.volunteer.toString() === req.user._id.toString() && rv.status !== 'cancelled'
        );

        if (!isRegistered) {
            return res.status(400).json({
                success: false,
                message: 'You were not registered for this event.'
            });
        }

        // Find or create feedback record
        let feedback = await Feedback.findOne({
            volunteer: req.user._id,
            event: eventId
        });

        if (!feedback) {
            feedback = await Feedback.create({
                volunteer: req.user._id,
                event: eventId
            });
        }

        // Update volunteer feedback
        feedback.volunteerFeedback = {
            rating,
            comment,
            givenAt: new Date()
        };

        // Update status
        if (feedback.organizerFeedback && feedback.organizerFeedback.givenAt) {
            feedback.status = 'completed';
        } else {
            feedback.status = 'volunteer-submitted';
        }

        await feedback.save();

        res.json({
            success: true,
            message: 'Feedback submitted successfully',
            feedback
        });
    } catch (error) {
        console.error('Volunteer feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/feedback/organizer
// @desc    Submit organizer feedback for a volunteer
// @access  Private/Admin
router.post('/organizer', protect, adminOnly, async (req, res) => {
    try {
        const { volunteerId, eventId, rating, comment } = req.body;

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

        // Find or create feedback record
        let feedback = await Feedback.findOne({
            volunteer: volunteerId,
            event: eventId
        });

        if (!feedback) {
            feedback = await Feedback.create({
                volunteer: volunteerId,
                event: eventId
            });
        }

        // Update organizer feedback
        feedback.organizerFeedback = {
            rating,
            comment,
            givenAt: new Date()
        };

        // Update status
        if (feedback.volunteerFeedback && feedback.volunteerFeedback.givenAt) {
            feedback.status = 'completed';
        } else {
            feedback.status = 'organizer-submitted';
        }

        await feedback.save();

        // Add bonus points for good organizer rating
        if (rating >= 4) {
            volunteer.points += rating * 5;
            await volunteer.save();
        }

        res.json({
            success: true,
            message: 'Organizer feedback submitted successfully',
            feedback
        });
    } catch (error) {
        console.error('Organizer feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/feedback/event/:eventId
// @desc    Get all feedback for an event
// @access  Private/Admin
router.get('/event/:eventId', protect, adminOnly, async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ event: req.params.eventId })
            .populate('volunteer', 'name email profilePhoto')
            .populate('event', 'title date')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: feedbacks.length,
            feedbacks
        });
    } catch (error) {
        console.error('Get event feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/feedback/my
// @desc    Get volunteer's feedback records
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ volunteer: req.user._id })
            .populate('event', 'title date category')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: feedbacks.length,
            feedbacks
        });
    } catch (error) {
        console.error('Get my feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/feedback/stats/:eventId
// @desc    Get feedback statistics for an event
// @access  Private/Admin
router.get('/stats/:eventId', protect, adminOnly, async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ event: req.params.eventId });

        const volunteerRatings = feedbacks
            .filter(f => f.volunteerFeedback && f.volunteerFeedback.rating)
            .map(f => f.volunteerFeedback.rating);

        const organizerRatings = feedbacks
            .filter(f => f.organizerFeedback && f.organizerFeedback.rating)
            .map(f => f.organizerFeedback.rating);

        const avgVolunteerRating = volunteerRatings.length > 0
            ? volunteerRatings.reduce((a, b) => a + b, 0) / volunteerRatings.length
            : 0;

        const avgOrganizerRating = organizerRatings.length > 0
            ? organizerRatings.reduce((a, b) => a + b, 0) / organizerRatings.length
            : 0;

        res.json({
            success: true,
            stats: {
                totalFeedbacks: feedbacks.length,
                volunteerSubmitted: feedbacks.filter(f => f.status === 'volunteer-submitted' || f.status === 'completed').length,
                organizerSubmitted: feedbacks.filter(f => f.status === 'organizer-submitted' || f.status === 'completed').length,
                completed: feedbacks.filter(f => f.status === 'completed').length,
                avgVolunteerRating: Math.round(avgVolunteerRating * 10) / 10,
                avgOrganizerRating: Math.round(avgOrganizerRating * 10) / 10
            }
        });
    } catch (error) {
        console.error('Feedback stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer',
        required: true
    },
    type: {
        type: String,
        enum: [
            'registration_success',
            'event_registration',
            'event_reminder',
            'approval_status',
            'new_event',
            'certificate_available',
            'feedback_request',
            'check_in_reminder',
            'thank_you',
            'badge_earned',
            'leaderboard_update',
            'general'
        ],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    relatedEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    relatedCertificate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certificate'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    actionUrl: {
        type: String,
        default: ''
    },
    sentVia: {
        type: String,
        enum: ['in-app', 'email', 'sms', 'both'],
        default: 'in-app'
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);

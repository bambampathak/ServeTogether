const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    volunteerRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    organizerRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    volunteerComment: {
        type: String,
        trim: true,
        default: ''
    },
    organizerComment: {
        type: String,
        trim: true,
        default: ''
    },
    organizerFeedback: {
        rating: { type: Number, min: 1, max: 5, default: null },
        comment: { type: String, trim: true, default: '' },
        givenAt: { type: Date, default: null }
    },
    volunteerFeedback: {
        rating: { type: Number, min: 1, max: 5, default: null },
        comment: { type: String, trim: true, default: '' },
        givenAt: { type: Date, default: null }
    },
    status: {
        type: String,
        enum: ['pending', 'volunteer-submitted', 'organizer-submitted', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

FeedbackSchema.index({ volunteer: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);

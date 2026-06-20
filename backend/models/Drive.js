const mongoose = require('mongoose');

const DriveSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    date: {
        type: Date,
        required: [true, 'Please add a date']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    skillsRequired: {
        type: [String],
        default: []
    },
    maxVolunteers: {
        type: Number,
        required: [true, 'Please specify maximum volunteers allowed']
    },
    volunteers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'
    }],
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    organizer: {
        type: String,
        default: 'NayePankh Foundation'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Drive', DriveSchema);

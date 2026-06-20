const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        trim: true
    },
    category: {
        type: String,
        enum: [
            'Education',
            'Health',
            'Environment',
            'Social Service',
            'Fundraising',
            'Community Development',
            'Youth Empowerment',
            'Women Empowerment',
            'Disaster Relief',
            'Other'
        ],
        required: [true, 'Event category is required']
    },
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    endDate: {
        type: Date
    },
    time: {
        type: String,
        required: [true, 'Event time is required']
    },
    endTime: {
        type: String
    },
    location: {
        address: { type: String, required: [true, 'Event location address is required'] },
        city: { type: String, required: [true, 'Event city is required'] },
        state: { type: String },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    image: {
        type: String,
        default: ''
    },
    maxVolunteers: {
        type: Number,
        required: [true, 'Maximum volunteers is required'],
        min: [1, 'At least 1 volunteer is required']
    },
    currentVolunteers: {
        type: Number,
        default: 0
    },
    requiredSkills: [{
        type: String,
        enum: [
            'Programming',
            'Teaching',
            'Photography',
            'Medical',
            'First Aid',
            'Event Management',
            'Social Media',
            'Graphic Design',
            'Content Writing',
            'Public Speaking',
            'Data Entry',
            'Driving',
            'Cleaning',
            'Counseling',
            'Other'
        ]
    }],
    registeredVolunteers: [{
        volunteer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Volunteer'
        },
        status: {
            type: String,
            enum: ['registered', 'confirmed', 'cancelled', 'completed'],
            default: 'registered'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        }
    }],
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    isQREnabled: {
        type: Boolean,
        default: false
    },
    qrCode: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        trim: true,
        default: ''
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

// Check if event is full
EventSchema.methods.isFull = function () {
    return this.currentVolunteers >= this.maxVolunteers;
};

// Check if volunteer is already registered
EventSchema.methods.isVolunteerRegistered = function (volunteerId) {
    return this.registeredVolunteers.some(
        rv => rv.volunteer.toString() === volunteerId.toString() && rv.status !== 'cancelled'
    );
};

module.exports = mongoose.model('Event', EventSchema);

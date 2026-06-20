const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
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
    checkInTime: {
        type: Date,
        default: null
    },
    checkOutTime: {
        type: Date,
        default: null
    },
    hoursVolunteered: {
        type: Number,
        default: 0
    },
    checkInMethod: {
        type: String,
        enum: ['qr', 'manual', 'self'],
        default: 'manual'
    },
    checkOutMethod: {
        type: String,
        enum: ['qr', 'manual', 'self'],
        default: 'manual'
    },
    status: {
        type: String,
        enum: ['checked-in', 'checked-out', 'absent'],
        default: 'absent'
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'
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

// Calculate hours when checking out
AttendanceSchema.methods.calculateHours = function () {
    if (this.checkInTime && this.checkOutTime) {
        const diff = this.checkOutTime - this.checkInTime;
        this.hoursVolunteered = Math.round(diff / (1000 * 60 * 60) * 100) / 100; // Round to 2 decimal places
    }
    return this.hoursVolunteered;
};

// Index for faster queries
AttendanceSchema.index({ volunteer: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);

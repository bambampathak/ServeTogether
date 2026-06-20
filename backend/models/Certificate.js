const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
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
    certificateId: {
        type: String,
        unique: true,
        required: true
    },
    volunteerName: {
        type: String,
        required: true
    },
    eventName: {
        type: String,
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    hoursCompleted: {
        type: Number,
        required: true,
        default: 0
    },
    issuedBy: {
        type: String,
        default: 'Nayepankh Foundation'
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    pdfUrl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'generated', 'sent', 'downloaded'],
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

// Generate unique certificate ID
CertificateSchema.pre('save', async function (next) {
    if (!this.certificateId) {
        const count = await this.constructor.countDocuments();
        const year = new Date().getFullYear();
        this.certificateId = `NP-CERT-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Certificate', CertificateSchema);

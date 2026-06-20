const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const VolunteerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [16, 'Volunteer must be at least 16 years old']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
        required: [true, 'Gender is required']
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    idProof: {
        type: String,
        default: ''
    },
    resume: {
        type: String,
        default: ''
    },
    skills: [{
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
    otherSkills: {
        type: String,
        trim: true,
        default: ''
    },
    availability: {
        weekdays: { type: Boolean, default: false },
        weekends: { type: Boolean, default: false },
        morning: { type: Boolean, default: false },
        afternoon: { type: Boolean, default: false },
        evening: { type: Boolean, default: false }
    },
    experience: {
        type: String,
        trim: true,
        default: ''
    },
    motivation: {
        type: String,
        trim: true,
        default: ''
    },
    emergencyContact: {
        name: { type: String, trim: true, default: '' },
        phone: { type: String, trim: true, default: '' },
        relationship: { type: String, trim: true, default: '' }
    },
    role: {
        type: String,
        enum: ['volunteer', 'admin'],
        default: 'volunteer'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'active', 'inactive'],
        default: 'pending'
    },
    totalHours: {
        type: Number,
        default: 0
    },
    totalEvents: {
        type: Number,
        default: 0
    },
    points: {
        type: Number,
        default: 0
    },
    badges: [{
        name: { type: String },
        icon: { type: String },
        earnedAt: { type: Date, default: Date.now }
    }],
    certificates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certificate'
    }],
    registeredEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
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

// Hash password before saving
VolunteerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
VolunteerSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
VolunteerSchema.methods.getSignedJwtToken = function () {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Virtual for full profile
VolunteerSchema.virtual('fullProfile').get(function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        phone: this.phone,
        age: this.age,
        gender: this.gender,
        city: this.city,
        skills: this.skills,
        availability: this.availability,
        totalHours: this.totalHours,
        totalEvents: this.totalEvents,
        points: this.points,
        badges: this.badges,
        status: this.status
    };
});

VolunteerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Volunteer', VolunteerSchema);

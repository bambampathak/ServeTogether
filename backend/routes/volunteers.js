const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const Notification = require('../models/Notification');
const { protect, approvedOnly } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

// @route   GET /api/volunteers
// @desc    Get all volunteers (with search/filter)
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
    try {
        const {
            search, skills, city, availability, status, gender,
            page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc'
        } = req.query;

        // Build filter query
        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (skills) {
            const skillsArray = skills.split(',');
            filter.skills = { $in: skillsArray };
        }

        if (city) {
            filter.city = { $regex: city, $options: 'i' };
        }

        if (status) {
            filter.status = status;
        }

        if (gender) {
            filter.gender = gender;
        }

        if (availability) {
            const availArray = availability.split(',');
            const availFilter = {};
            availArray.forEach(a => {
                availFilter[a] = true;
            });
            filter.availability = availFilter;
        }

        // Sort
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const volunteers = await Volunteer.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Volunteer.countDocuments(filter);

        res.json({
            success: true,
            count: volunteers.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            volunteers
        });
    } catch (error) {
        console.error('Get volunteers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/volunteers/leaderboard
// @desc    Get volunteer leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
    try {
        const { period = 'all', limit = 10 } = req.query;

        const volunteers = await Volunteer.find({ status: { $in: ['approved', 'active'] } })
            .select('name profilePhoto city totalHours totalEvents points badges skills')
            .sort({ points: -1, totalHours: -1, totalEvents: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            leaderboard: volunteers
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/volunteers/:id
// @desc    Get single volunteer profile
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id)
            .populate('certificates')
            .populate('registeredEvents');

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        res.json({
            success: true,
            volunteer
        });
    } catch (error) {
        console.error('Get volunteer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/volunteers/profile
// @desc    Update volunteer profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const {
            name, phone, age, gender, city, address,
            skills, otherSkills, availability, experience, motivation,
            emergencyContact
        } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (age) updateData.age = age;
        if (gender) updateData.gender = gender;
        if (city) updateData.city = city;
        if (address) updateData.address = address;
        if (skills) updateData.skills = skills;
        if (otherSkills) updateData.otherSkills = otherSkills;
        if (availability) updateData.availability = availability;
        if (experience) updateData.experience = experience;
        if (motivation) updateData.motivation = motivation;
        if (emergencyContact) updateData.emergencyContact = emergencyContact;

        const volunteer = await Volunteer.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            volunteer
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// @route   POST /api/volunteers/profile/photo
// @desc    Upload profile photo
// @access  Private
router.post('/profile/photo', protect, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        // Delete old photo from Cloudinary if exists
        const volunteer = await Volunteer.findById(req.user._id);
        if (volunteer.profilePhoto) {
            // Extract public ID from URL and delete
            try {
                const urlParts = volunteer.profilePhoto.split('/');
                const publicIdWithExt = urlParts.slice(-2).join('/');
                const publicId = publicIdWithExt.split('.')[0];
                await deleteFromCloudinary(publicId);
            } catch (e) {
                // Ignore deletion errors
            }
        }

        // Upload new photo
        const result = await uploadToCloudinary(
            req.file.buffer,
            'profile-photos',
            `volunteer-${req.user._id}-${Date.now()}`
        );

        volunteer.profilePhoto = result.url;
        await volunteer.save();

        res.json({
            success: true,
            photoUrl: result.url,
            volunteer
        });
    } catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading photo'
        });
    }
});

// @route   POST /api/volunteers/profile/idproof
// @desc    Upload ID proof
// @access  Private
router.post('/profile/idproof', protect, upload.single('idProof'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const result = await uploadToCloudinary(
            req.file.buffer,
            'id-proofs',
            `idproof-${req.user._id}-${Date.now()}`
        );

        const volunteer = await Volunteer.findById(req.user._id);
        volunteer.idProof = result.url;
        await volunteer.save();

        res.json({
            success: true,
            idProofUrl: result.url,
            volunteer
        });
    } catch (error) {
        console.error('Upload ID proof error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading ID proof'
        });
    }
});

// @route   POST /api/volunteers/profile/resume
// @desc    Upload resume
// @access  Private
router.post('/profile/resume', protect, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const result = await uploadToCloudinary(
            req.file.buffer,
            'resumes',
            `resume-${req.user._id}-${Date.now()}`
        );

        const volunteer = await Volunteer.findById(req.user._id);
        volunteer.resume = result.url;
        await volunteer.save();

        res.json({
            success: true,
            resumeUrl: result.url,
            volunteer
        });
    } catch (error) {
        console.error('Upload resume error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading resume'
        });
    }
});

module.exports = router;

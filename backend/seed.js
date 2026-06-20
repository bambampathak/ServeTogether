/**
 * ServeTogether Database Seed Script
 * 
 * This script populates the database with sample data for development and testing.
 * Run with: node seed.js
 * 
 * WARNING: This will clear existing data before seeding!
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
const Volunteer = require('./models/Volunteer');
const Event = require('./models/Event');
const Attendance = require('./models/Attendance');
const Certificate = require('./models/Certificate');
const Feedback = require('./models/Feedback');
const Notification = require('./models/Notification');

// Sample data
const adminData = {
    name: 'Admin User',
    email: 'admin@nayepankh.org',
    password: 'admin123',
    phone: '9876543210',
    age: 30,
    gender: 'Male',
    city: 'Delhi',
    role: 'admin',
    status: 'approved',
    skills: ['Event Management', 'Public Speaking', 'Social Media'],
    availability: {
        weekdays: true,
        weekends: true,
        morning: true,
        afternoon: true,
        evening: false
    },
    experience: '5+ years in NGO management and community service',
    motivation: 'To make a positive impact in society through organized volunteering',
    emergencyContact: {
        name: 'Admin Emergency',
        phone: '9876543211',
        relationship: 'Friend'
    }
};

const volunteerData = [
    {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        password: 'volunteer123',
        phone: '9876540001',
        age: 22,
        gender: 'Female',
        city: 'Delhi',
        skills: ['Teaching', 'Counseling', 'Art & Craft'],
        availability: { weekdays: true, weekends: false, morning: true, afternoon: true, evening: false },
        experience: '2 years tutoring underprivileged children',
        motivation: 'I believe education can change lives',
        emergencyContact: { name: 'Raj Sharma', phone: '9876540002', relationship: 'Father' },
        status: 'approved',
        totalHours: 45,
        totalEvents: 8,
        points: 450
    },
    {
        name: 'Arjun Patel',
        email: 'arjun.patel@example.com',
        password: 'volunteer123',
        phone: '9876540003',
        age: 25,
        gender: 'Male',
        city: 'Mumbai',
        skills: ['Medical', 'First Aid', 'Driving'],
        availability: { weekdays: false, weekends: true, morning: true, afternoon: false, evening: true },
        experience: '3 years as a medical volunteer at local hospitals',
        motivation: 'Healthcare should be accessible to everyone',
        emergencyContact: { name: 'Meera Patel', phone: '9876540004', relationship: 'Mother' },
        status: 'approved',
        totalHours: 60,
        totalEvents: 12,
        points: 600
    },
    {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        password: 'volunteer123',
        phone: '9876540005',
        age: 28,
        gender: 'Female',
        city: 'Hyderabad',
        skills: ['Social Media', 'Graphic Design', 'Content Writing'],
        availability: { weekdays: true, weekends: true, morning: false, afternoon: true, evening: true },
        experience: '4 years in digital marketing and content creation',
        motivation: 'Using my creative skills for social good',
        emergencyContact: { name: 'Vikram Reddy', phone: '9876540006', relationship: 'Brother' },
        status: 'approved',
        totalHours: 35,
        totalEvents: 6,
        points: 350
    },
    {
        name: 'Rahul Kumar',
        email: 'rahul.kumar@example.com',
        password: 'volunteer123',
        phone: '9876540007',
        age: 20,
        gender: 'Male',
        city: 'Bangalore',
        skills: ['Programming', 'Web Development', 'Data Entry'],
        availability: { weekdays: true, weekends: false, morning: false, afternoon: true, evening: true },
        experience: '1 year building websites for local NGOs',
        motivation: 'Technology can solve social problems',
        emergencyContact: { name: 'Sunita Kumar', phone: '9876540008', relationship: 'Mother' },
        status: 'approved',
        totalHours: 25,
        totalEvents: 5,
        points: 250
    },
    {
        name: 'Ananya Gupta',
        email: 'ananya.gupta@example.com',
        password: 'volunteer123',
        phone: '9876540009',
        age: 23,
        gender: 'Female',
        city: 'Delhi',
        skills: ['Photography', 'Event Management', 'Public Speaking'],
        availability: { weekdays: false, weekends: true, morning: true, afternoon: true, evening: false },
        experience: '2 years documenting NGO events through photography',
        motivation: 'Every story deserves to be told',
        emergencyContact: { name: 'Deepak Gupta', phone: '9876540010', relationship: 'Father' },
        status: 'approved',
        totalHours: 50,
        totalEvents: 10,
        points: 500
    },
    {
        name: 'Vivek Singh',
        email: 'vivek.singh@example.com',
        password: 'volunteer123',
        phone: '9876540011',
        age: 35,
        gender: 'Male',
        city: 'Lucknow',
        skills: ['Teaching', 'Public Speaking', 'Counseling'],
        availability: { weekdays: true, weekends: true, morning: true, afternoon: false, evening: false },
        experience: '10 years as a teacher and community leader',
        motivation: 'Empowering youth through education and mentorship',
        emergencyContact: { name: 'Kavita Singh', phone: '9876540012', relationship: 'Wife' },
        status: 'approved',
        totalHours: 80,
        totalEvents: 15,
        points: 800
    },
    {
        name: 'Meera Joshi',
        email: 'meera.joshi@example.com',
        password: 'volunteer123',
        phone: '9876540013',
        age: 27,
        gender: 'Female',
        city: 'Pune',
        skills: ['Medical', 'First Aid', 'Counseling'],
        availability: { weekdays: true, weekends: false, morning: true, afternoon: true, evening: false },
        experience: '5 years as a nurse and health educator',
        motivation: 'Health is a right, not a privilege',
        emergencyContact: { name: 'Arun Joshi', phone: '9876540014', relationship: 'Husband' },
        status: 'approved',
        totalHours: 55,
        totalEvents: 9,
        points: 550
    },
    {
        name: 'Karan Mehta',
        email: 'karan.mehta@example.com',
        password: 'volunteer123',
        phone: '9876540015',
        age: 19,
        gender: 'Male',
        city: 'Ahmedabad',
        skills: ['Photography', 'Social Media'],
        availability: { weekdays: false, weekends: true, morning: true, afternoon: true, evening: false },
        experience: '6 months volunteering at local events',
        motivation: 'Learning while giving back to the community',
        emergencyContact: { name: 'Pooja Mehta', phone: '9876540016', relationship: 'Sister' },
        status: 'pending'
    },
    {
        name: 'Divya Nair',
        email: 'divya.nair@example.com',
        password: 'volunteer123',
        phone: '9876540017',
        age: 24,
        gender: 'Female',
        city: 'Chennai',
        skills: ['Teaching', 'Music', 'Art & Craft'],
        availability: { weekdays: true, weekends: true, morning: false, afternoon: true, evening: true },
        experience: '3 years teaching music to underprivileged children',
        motivation: 'Art and music can heal and empower',
        emergencyContact: { name: 'Sunil Nair', phone: '9876540018', relationship: 'Father' },
        status: 'pending'
    },
    {
        name: 'Amit Verma',
        email: 'amit.verma@example.com',
        password: 'volunteer123',
        phone: '9876540019',
        age: 32,
        gender: 'Male',
        city: 'Jaipur',
        skills: ['Driving', 'Event Management', 'Cooking'],
        availability: { weekdays: false, weekends: true, morning: true, afternoon: true, evening: true },
        experience: '7 years organizing community food drives',
        motivation: 'No one should go hungry',
        emergencyContact: { name: 'Ritu Verma', phone: '9876540020', relationship: 'Wife' },
        status: 'approved',
        totalHours: 70,
        totalEvents: 14,
        points: 700
    }
];

const eventData = [
    {
        title: 'Education Drive - Teach a Child',
        description: 'Join us in teaching underprivileged children basic literacy and numeracy skills. This event focuses on providing quality education to children who lack access to proper schooling. Volunteers will work in small groups with children aged 6-14, helping them with reading, writing, and basic mathematics.',
        category: 'Education',
        date: new Date('2026-07-15'),
        endDate: new Date('2026-07-15'),
        time: '09:00 AM',
        endTime: '12:00 PM',
        location: {
            address: 'Community Hall, Sector 5',
            city: 'Delhi',
            state: 'Delhi',
            coordinates: { lat: 28.6139, lng: 77.2090 }
        },
        maxVolunteers: 20,
        requiredSkills: ['Teaching', 'Counseling', 'Art & Craft'],
        status: 'upcoming',
        isQREnabled: true
    },
    {
        title: 'Health Camp - Free Medical Checkup',
        description: 'A free health checkup camp for underprivileged communities. Medical professionals and trained volunteers will provide basic health screenings, blood pressure checks, and health education. This event aims to make healthcare accessible to those who cannot afford regular medical visits.',
        category: 'Health',
        date: new Date('2026-07-20'),
        endDate: new Date('2026-07-20'),
        time: '08:00 AM',
        endTime: '02:00 PM',
        location: {
            address: 'Primary Health Center, Andheri West',
            city: 'Mumbai',
            state: 'Maharashtra',
            coordinates: { lat: 19.1197, lng: 72.8464 }
        },
        maxVolunteers: 15,
        requiredSkills: ['Medical', 'First Aid', 'Counseling'],
        status: 'upcoming',
        isQREnabled: true
    },
    {
        title: 'Tree Plantation Drive - Green City',
        description: 'Let\'s make our city greener! Join us for a tree plantation drive where we aim to plant 500 trees across the city. Volunteers will help with digging, planting, watering, and creating awareness about environmental conservation. All tools and saplings will be provided.',
        category: 'Environment',
        date: new Date('2026-08-05'),
        endDate: new Date('2026-08-05'),
        time: '07:00 AM',
        endTime: '11:00 AM',
        location: {
            address: 'City Park, Banjara Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            coordinates: { lat: 17.4156, lng: 78.4489 }
        },
        maxVolunteers: 30,
        requiredSkills: ['Driving', 'Event Management'],
        status: 'upcoming',
        isQREnabled: true
    },
    {
        title: 'Youth Empowerment Workshop',
        description: 'A workshop designed to empower young people with life skills, career guidance, and mental health awareness. Volunteers will facilitate group discussions, mentor participants, and share their professional experiences. This is a great opportunity to inspire the next generation.',
        category: 'Youth Empowerment',
        date: new Date('2026-08-10'),
        endDate: new Date('2026-08-10'),
        time: '10:00 AM',
        endTime: '04:00 PM',
        location: {
            address: 'Youth Center, Indiranagar',
            city: 'Bangalore',
            state: 'Karnataka',
            coordinates: { lat: 12.9784, lng: 77.6408 }
        },
        maxVolunteers: 10,
        requiredSkills: ['Public Speaking', 'Counseling', 'Teaching'],
        status: 'upcoming',
        isQREnabled: true
    },
    {
        title: 'Women Safety Awareness Campaign',
        description: 'An awareness campaign focused on women\'s safety, self-defense basics, and legal rights education. Volunteers will help organize awareness sessions, distribute educational materials, and assist with self-defense training workshops. Together we can create safer communities.',
        category: 'Women Empowerment',
        date: new Date('2026-08-15'),
        endDate: new Date('2026-08-15'),
        time: '09:00 AM',
        endTime: '01:00 PM',
        location: {
            address: 'Community Center, Connaught Place',
            city: 'Delhi',
            state: 'Delhi',
            coordinates: { lat: 28.6315, lng: 77.2167 }
        },
        maxVolunteers: 25,
        requiredSkills: ['Public Speaking', 'Social Media', 'Event Management'],
        status: 'upcoming',
        isQREnabled: true
    },
    {
        title: 'Fundraising Gala - Hope for Tomorrow',
        description: 'A fundraising gala event to raise funds for Nayepankh Foundation\'s ongoing community projects. Volunteers will help with event setup, guest management, food service, and cleanup. This is our flagship fundraising event and we need enthusiastic volunteers to make it successful.',
        category: 'Fundraising',
        date: new Date('2026-06-25'),
        endDate: new Date('2026-06-25'),
        time: '06:00 PM',
        endTime: '10:00 PM',
        location: {
            address: 'Hotel Grand, MG Road',
            city: 'Pune',
            state: 'Maharashtra',
            coordinates: { lat: 18.5196, lng: 73.8554 }
        },
        maxVolunteers: 40,
        requiredSkills: ['Event Management', 'Social Media', 'Photography', 'Driving'],
        status: 'completed',
        isQREnabled: true
    },
    {
        title: 'Community Kitchen - Feed the Hungry',
        description: 'A community kitchen event where we prepare and distribute meals to homeless and underprivileged people. Volunteers will help with food preparation, packaging, distribution, and cleanup. We aim to serve 500 meals during this event.',
        category: 'Social Service',
        date: new Date('2026-06-10'),
        endDate: new Date('2026-06-10'),
        time: '08:00 AM',
        endTime: '02:00 PM',
        location: {
            address: 'Community Kitchen, Hazratganj',
            city: 'Lucknow',
            state: 'Uttar Pradesh',
            coordinates: { lat: 26.8467, lng: 80.9462 }
        },
        maxVolunteers: 25,
        requiredSkills: ['Cooking', 'Event Management', 'Driving'],
        status: 'completed',
        isQREnabled: true
    },
    {
        title: 'Digital Literacy Workshop for Seniors',
        description: 'Help senior citizens learn basic digital skills - using smartphones, internet browsing, online banking, and staying safe online. Volunteers will provide one-on-one assistance and patience is key! This workshop helps bridge the digital divide for our elderly community members.',
        category: 'Education',
        date: new Date('2026-09-01'),
        endDate: new Date('2026-09-01'),
        time: '10:00 AM',
        endTime: '01:00 PM',
        location: {
            address: 'Senior Citizens Center, Anna Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            coordinates: { lat: 13.0827, lng: 80.2707 }
        },
        maxVolunteers: 15,
        requiredSkills: ['Teaching', 'Counseling', 'Data Entry'],
        status: 'upcoming',
        isQREnabled: true
    }
];

// Connect to MongoDB and seed data
const seedDatabase = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/servetogether';
        console.log('Connecting to MongoDB...');
        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Clear existing data
        console.log('Clearing existing data...');
        await Volunteer.deleteMany({});
        await Event.deleteMany({});
        await Attendance.deleteMany({});
        await Certificate.deleteMany({});
        await Feedback.deleteMany({});
        await Notification.deleteMany({});
        console.log('Existing data cleared.');

        // Create admin user
        console.log('Creating admin user...');
        const admin = await Volunteer.create(adminData);
        console.log(`Admin created: ${admin.name} (${admin.email})`);

        // Create volunteer users
        console.log('Creating volunteer users...');
        const volunteers = [];
        for (const vData of volunteerData) {
            const volunteer = await Volunteer.create(vData);
            volunteers.push(volunteer);
            console.log(`Volunteer created: ${volunteer.name} (${volunteer.email}) - Status: ${volunteer.status}`);
        }

        // Create events
        console.log('Creating events...');
        const events = [];
        for (const eData of eventData) {
            const event = await Event.create({
                ...eData,
                organizer: admin._id
            });
            events.push(event);
            console.log(`Event created: ${event.title} - ${event.category} - ${event.status}`);
        }

        // Register volunteers for events
        console.log('Registering volunteers for events...');
        for (let i = 0; i < volunteers.length; i++) {
            const volunteer = volunteers[i];
            if (volunteer.status !== 'approved') continue;

            // Register each approved volunteer for 2-3 random upcoming/completed events
            const eligibleEvents = events.filter(e => e.status === 'upcoming' || e.status === 'completed');
            const numEvents = Math.min(2 + Math.floor(Math.random() * 2), eligibleEvents.length);
            const shuffledEvents = eligibleEvents.sort(() => 0.5 - Math.random());
            const selectedEvents = shuffledEvents.slice(0, numEvents);

            for (const event of selectedEvents) {
                // Add volunteer to event's registeredVolunteers
                event.registeredVolunteers.push({
                    volunteer: volunteer._id,
                    status: event.status === 'completed' ? 'completed' : 'registered'
                });
                event.currentVolunteers += 1;
                await event.save();

                // Add event to volunteer's registeredEvents
                volunteer.registeredEvents.push(event._id);
                await volunteer.save();

                console.log(`${volunteer.name} registered for "${event.title}"`);
            }
        }

        // Create attendance records for completed events
        console.log('Creating attendance records for completed events...');
        const completedEvents = events.filter(e => e.status === 'completed');

        for (const event of completedEvents) {
            const registeredVolunteers = event.registeredVolunteers.filter(rv => rv.status === 'completed');

            for (const rv of registeredVolunteers) {
                const volunteer = volunteers.find(v => v._id.toString() === rv.volunteer.toString());
                if (!volunteer) continue;

                const hoursVolunteered = 2 + Math.floor(Math.random() * 4); // 2-5 hours
                const checkInTime = new Date(event.date);
                checkInTime.setHours(8, 0, 0);
                const checkOutTime = new Date(event.date);
                checkOutTime.setHours(8 + hoursVolunteered, 0, 0);

                const attendance = await Attendance.create({
                    volunteer: volunteer._id,
                    event: event._id,
                    checkInTime,
                    checkOutTime,
                    hoursVolunteered,
                    checkInMethod: 'manual',
                    checkOutMethod: 'manual',
                    status: 'checked-out',
                    verifiedBy: admin._id
                });

                console.log(`Attendance: ${volunteer.name} at "${event.title}" - ${hoursVolunteered}h`);
            }
        }

        // Create certificates for completed event attendance
        console.log('Creating certificates...');
        const attendanceRecords = await Attendance.find({ status: 'checked-out' });

        for (const attendance of attendanceRecords) {
            const volunteer = volunteers.find(v => v._id.toString() === attendance.volunteer.toString());
            const event = events.find(e => e._id.toString() === attendance.event.toString());
            if (!volunteer || !event) continue;

            const certificate = await Certificate.create({
                volunteer: volunteer._id,
                event: event._id,
                volunteerName: volunteer.name,
                eventName: event.title,
                eventDate: event.date,
                hoursCompleted: attendance.hoursVolunteered,
                issuedBy: 'Nayepankh Foundation',
                status: 'generated'
            });

            // Add certificate to volunteer
            volunteer.certificates.push(certificate._id);
            await volunteer.save();

            console.log(`Certificate: ${certificate.certificateId} for ${volunteer.name}`);
        }

        // Create some notifications
        console.log('Creating sample notifications...');
        const approvedVolunteers = volunteers.filter(v => v.status === 'approved');

        for (const volunteer of approvedVolunteers.slice(0, 5)) {
            await Notification.create({
                recipient: volunteer._id,
                type: 'general',
                title: 'Welcome to ServeTogether!',
                message: 'Thank you for joining our volunteer community. Browse upcoming events and start making a difference!',
                sentVia: 'in-app',
                isRead: false
            });

            await Notification.create({
                recipient: volunteer._id,
                type: 'event_registration',
                title: 'New Event Available',
                message: 'A new event has been posted. Check the events page for details and register!',
                sentVia: 'in-app',
                isRead: Math.random() > 0.5
            });
        }

        // Add badges to top volunteers
        console.log('Adding badges to volunteers...');
        const badgeDefinitions = [
            { name: 'First Step', icon: '🌱', condition: (v) => v.totalEvents >= 1 },
            { name: 'Dedicated', icon: '💪', condition: (v) => v.totalEvents >= 5 },
            { name: 'Champion', icon: '🏆', condition: (v) => v.totalEvents >= 10 },
            { name: 'Time Hero', icon: '⏰', condition: (v) => v.totalHours >= 20 },
            { name: 'Century', icon: '💯', condition: (v) => v.totalHours >= 100 },
            { name: 'Star', icon: '⭐', condition: (v) => v.points >= 500 },
            { name: 'Superstar', icon: '🌟', condition: (v) => v.points >= 1000 }
        ];

        for (const volunteer of approvedVolunteers) {
            const earnedBadges = badgeDefinitions.filter(badge => badge.condition(volunteer));
            for (const badge of earnedBadges) {
                volunteer.badges.push({
                    name: badge.name,
                    icon: badge.icon,
                    earnedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
                });
            }
            await volunteer.save();
            if (earnedBadges.length > 0) {
                console.log(`${volunteer.name} earned badges: ${earnedBadges.map(b => `${b.icon} ${b.name}`).join(', ')}`);
            }
        }

        // Print summary
        console.log('\n========================================');
        console.log('   SEED DATA SUMMARY');
        console.log('========================================');
        console.log(`Admin:        1 (${admin.email})`);
        console.log(`Volunteers:   ${volunteers.length} (${approvedVolunteers.length} approved, ${volunteers.length - approvedVolunteers.length} pending)`);
        console.log(`Events:       ${events.length} (${events.filter(e => e.status === 'upcoming').length} upcoming, ${completedEvents.length} completed)`);
        console.log(`Attendance:   ${attendanceRecords.length} records`);
        console.log(`Certificates: ${await Certificate.countDocuments()} generated`);
        console.log(`Notifications: ${await Notification.countDocuments()} created`);
        console.log('========================================\n');

        console.log('✅ Database seeded successfully!');
        console.log('\nYou can now login with:');
        console.log(`  Admin:     admin@nayepankh.org / admin123`);
        console.log(`  Volunteer: priya.sharma@example.com / volunteer123`);
        console.log(`  Pending:   karan.mehta@example.com / volunteer123`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'https://serve-together-six.vercel.app',
    'https://serve-together-six.vercel.app/'
];

if (process.env.CLIENT_URL) {
    const envOrigins = process.env.CLIENT_URL.split(',').map(url => url.trim()).filter(Boolean);
    envOrigins.forEach(url => {
        if (!allowedOrigins.includes(url)) {
            allowedOrigins.push(url);
        }
        const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
        const slashUrl = cleanUrl + '/';
        if (!allowedOrigins.includes(cleanUrl)) allowedOrigins.push(cleanUrl);
        if (!allowedOrigins.includes(slashUrl)) allowedOrigins.push(slashUrl);
    });
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const driveRoutes = require('./routes/drives');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/drives', driveRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ServeTogether Volunteer Registration API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Connect to MongoDB Atlas (with local fallback)
const connectDB = async () => {
    const primaryURI = process.env.MONGODB_URI;
    const localURI = 'mongodb://127.0.0.1:27017/servetogether';

    try {
        if (!primaryURI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        const conn = await mongoose.connect(primaryURI);
        console.log(`MongoDB Connected (Atlas): ${conn.connection.host}`);
    } catch (error) {
        console.warn(`MongoDB Atlas Connection Failed: ${error.message}`);
        console.log('Attempting connection to local MongoDB database...');
        try {
            const conn = await mongoose.connect(localURI);
            console.log(`MongoDB Connected (Local): ${conn.connection.host}`);
        } catch (localError) {
            console.error(`Local MongoDB Connection Error: ${localError.message}`);
            process.exit(1);
        }
    }
};

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`ServeTogether Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
});

module.exports = app;

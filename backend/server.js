const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
initDB();

const authRoute = require('./routes/authRoute');
const attendanceRoute = require('./routes/attendanceRoute');
const sessionRoute = require('./routes/sessionRoute');
const reportsRoute = require('./routes/reportsRoute');
const adminRoute = require('./routes/adminRoute');
const settingsRoute = require('./routes/settingsRoute');

// Routes
app.use('/api/auth', authRoute);
app.use('/api/attendance', attendanceRoute);
app.use('/api/session', sessionRoute);
app.use('/api/reports', reportsRoute);
app.use('/api/admin', adminRoute);
app.use('/api/settings', settingsRoute);

// Routes Placeholder
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

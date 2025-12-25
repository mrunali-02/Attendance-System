const express = require('express');
const router = express.Router();
const { initDB } = require('../db');

// Get Settings
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const db = await initDB();

    try {
        let settings = await db.get("SELECT * FROM student_settings WHERE user_id = ?", [userId]);
        if (!settings) {
            // Return defaults if no settings found (could also insert here)
            settings = {
                theme: 'system',
                text_size: 'medium',
                notifications_start: 1,
                notifications_end: 1,
                show_profile_photo: 1,
                attendance_threshold: 75
            };
        }
        res.json(settings);
    } catch (error) {
        console.error('Fetch Settings Error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update Settings
router.post('/update', async (req, res) => {
    const { userId, theme, textSize, notificationsStart, notificationsEnd, showProfilePhoto, attendanceThreshold } = req.body;
    const db = await initDB();

    try {
        await db.run(`
            INSERT INTO student_settings (user_id, theme, text_size, notifications_start, notifications_end, show_profile_photo, attendance_threshold)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            theme = VALUES(theme),
            text_size = VALUES(text_size),
            notifications_start = VALUES(notifications_start),
            notifications_end = VALUES(notifications_end),
            show_profile_photo = VALUES(show_profile_photo),
            attendance_threshold = VALUES(attendance_threshold)
        `, [userId, theme, textSize, notificationsStart, notificationsEnd, showProfilePhoto, attendanceThreshold]);

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Create Support Request
router.post('/support', async (req, res) => {
    const { userId, type, description } = req.body;
    const db = await initDB();

    if (!userId || !type || !description) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        await db.run(
            "INSERT INTO support_requests (user_id, type, description) VALUES (?, ?, ?)",
            [userId, type, description]
        );
        res.json({ message: 'Support request submitted successfully' });
    } catch (error) {
        console.error('Support Request Error:', error);
        res.status(500).json({ error: 'Failed to submit support request' });
    }
});

module.exports = router;

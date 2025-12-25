const express = require('express');
const router = express.Router();
const { initDB } = require('../db');

// Get teacher dashboard stats
router.get('/teacher/:teacherId/stats', async (req, res) => {
    const { teacherId } = req.params;
    const db = await initDB();

    try {
        // 1. Total Sessions
        const totalSessions = await db.get(
            "SELECT COUNT(*) as count FROM sessions WHERE teacher_id = ?",
            [teacherId]
        );

        // 2. Average Attendance % across all sessions
        const sessions = await db.all(
            "SELECT id, metadata FROM sessions WHERE teacher_id = ? AND status = 'CLOSED'",
            [teacherId]
        );

        let totalPercentage = 0;
        let validSessions = 0;

        for (const session of sessions) {
            const attendance = await db.get(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
                FROM attendance 
                WHERE session_id = ?
             `, [session.id]);

            if (attendance && attendance.total > 0) {
                totalPercentage += (attendance.present / attendance.total) * 100;
                validSessions++;
            }
        }

        const avgAttendance = validSessions > 0 ? (totalPercentage / validSessions).toFixed(1) : 0;

        // 3. Recent Activity (Last 5) - reuse logic or fetched by client
        // Client already fetches recent sessions, we can aggregate grouped by course here if needed

        res.json({
            totalSessions: totalSessions.count,
            avgAttendance: avgAttendance
        });

    } catch (error) {
        console.error('Report stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { initDB } = require('../db');

// Helper: Calculate distance between two coords (Haversine formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000; // Distance in meters
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Create Session (Teacher)
// Create Session (Teacher)
router.post('/create', async (req, res) => {
    const { teacherId, lat, lng, radius, durationMinutes, metadata } = req.body;

    if (!teacherId || !lat || !lng) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await initDB();

    // 1. Concurrency Check: Ensure no other ACTIVE session exists for this teacher
    try {
        const activeSession = await db.get(
            "SELECT id FROM sessions WHERE teacher_id = ? AND status = 'ACTIVE'",
            [teacherId]
        );

        if (activeSession) {
            return res.status(409).json({
                error: 'You already have an active session. Please end it before starting a new one.',
                sessionId: activeSession.id
            });
        }

        const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit OTP
        const expiresAt = new Date(Date.now() + (durationMinutes || 5) * 60000); // Use Date object for mysql2

        // Use more compatible SQL date format just in case, or rely on driver. 
        // Best to use standard MySQL date format string if driver conversion is flaky.
        const pad = (n) => n.toString().padStart(2, '0');
        const mysqlExpiresAt = `${expiresAt.getFullYear()}-${pad(expiresAt.getMonth() + 1)}-${pad(expiresAt.getDate())} ${pad(expiresAt.getHours())}:${pad(expiresAt.getMinutes())}:${pad(expiresAt.getSeconds())}`;

        const result = await db.run(
            `INSERT INTO sessions (code, teacher_id, active, status, expires_at, lat, lng, radius, metadata) 
       VALUES (?, ?, 1, 'ACTIVE', ?, ?, ?, ?, ?)`,
            [code, teacherId, mysqlExpiresAt, lat, lng, radius || 50, metadata]
        );

        res.json({ sessionId: result.lastID, code, expiresAt });

    } catch (error) {
        console.error('Create Session Error Detailed:', error);
        // Return duplicate entry request as 409 if needed, though we checked above.
        res.status(500).json({ error: 'Failed to start session: ' + error.message });
    }
});

// Mark Attendance (Student)
router.post('/mark', async (req, res) => {
    const { studentId, code, lat, lng } = req.body;
    const db = await initDB();

    try {
        // 1. Verify Session by Code (Find active session with this code)
        const session = await db.get("SELECT * FROM sessions WHERE code = ? AND status = 'ACTIVE'", [code]);

        if (!session) return res.status(404).json({ error: 'Invalid or expired OTP' });

        const sessionId = session.id;

        if (new Date(session.expires_at) < new Date()) {
            await db.run("UPDATE sessions SET status = 'CLOSED', active = 0 WHERE id = ?", [sessionId]);
            return res.status(400).json({ error: 'Session expired' });
        }

        // 2. Verify OTP (Redundant check since we queried by it, but safe)
        if (session.code !== code) return res.status(400).json({ error: 'Invalid OTP' });

        // 3. Verify Location
        const distance = getDistanceFromLatLonInKm(session.lat, session.lng, lat, lng);
        if (distance > session.radius) {
            return res.status(400).json({ error: `You are too far from the class. Distance: ${Math.round(distance)}m` });
        }

        // 4. Verify Student Enrollment (Enrollment Match)
        const student = await db.get("SELECT * FROM enrolled_students WHERE student_id = ?", [studentId]);
        if (student && session.metadata) {
            const meta = JSON.parse(session.metadata);
            // Check if session has class info restrictions
            if (meta.year && meta.branch && meta.division) {
                if (student.year !== meta.year || student.branch !== meta.branch || student.division !== meta.division) {
                    return res.status(403).json({
                        error: `You are not enrolled in this class (${meta.year} ${meta.branch} ${meta.division}).`
                    });
                }
            }
        }

        // 5. Mark Attendance
        await db.run(
            "INSERT INTO attendance (session_id, student_id) VALUES (?, ?)",
            [sessionId, studentId]
        );

        res.json({ message: 'Attendance marked successfully', timestamp: new Date() });

    } catch (error) {
        if (error.errno === 19) { // SQLITE_CONSTRAINT
            return res.status(400).json({ error: 'Attendance already marked' });
        }
        console.error('Mark Attendance Error:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});

// Student Endpoints

// Get Student Stats
router.get('/student/:id/stats', async (req, res) => {
    const { id } = req.params;
    const db = await initDB();

    try {
        const stats = await db.get(`
            SELECT 
                COUNT(*) as total_classes,
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count
            FROM attendance
            WHERE student_id = ?
        `, [id]);

        const total = stats.total_classes || 0;
        const present = stats.present_count || 0;
        const absent = stats.absent_count || 0;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        res.json({ total, present, absent, percentage });
    } catch (error) {
        console.error('Get Student Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get Student History
router.get('/student/:id/history', async (req, res) => {
    const { id } = req.params;
    const db = await initDB();

    try {
        const history = await db.all(`
            SELECT 
                a.status,
                a.marked_at,
                s.created_at as session_date,
                s.metadata,
                u.name as teacher_name
            FROM attendance a
            JOIN sessions s ON a.session_id = s.id
            JOIN users u ON s.teacher_id = u.id
            WHERE a.student_id = ?
            ORDER BY s.created_at DESC
        `, [id]);

        const formattedHistory = history.map(record => {
            const meta = record.metadata ? JSON.parse(record.metadata) : {};
            return {
                status: record.status,
                markedAt: record.marked_at,
                date: record.session_date,
                subject: meta.subject || 'N/A',
                teacherName: record.teacher_name || 'Unknown',
                topic: meta.topic || ''
            };
        });

        res.json(formattedHistory);
    } catch (error) {
        console.error('Get Student History Error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Get Active Session for Student's Class
router.get('/student/:id/active-session', async (req, res) => {
    const { id } = req.params;
    const db = await initDB();

    try {
        // 1. Get Student's Class Details
        const student = await db.get("SELECT * FROM enrolled_students WHERE student_id = ?", [id]);

        if (!student) {
            return res.status(404).json({ error: 'Student enrollment not found' });
        }

        const { year, branch, division } = student;

        // 2. Get All Active Sessions
        // Note: In a production DB with JSON columns, we'd query directly. 
        // Here we fetch all active sessions and filter in JS (assuming low concurrency of active sessions).
        const activeSessions = await db.all("SELECT * FROM sessions WHERE status = 'ACTIVE'");

        const matchingSession = activeSessions.find(session => {
            const meta = session.metadata ? JSON.parse(session.metadata) : {};
            return meta.year === year && meta.branch === branch && meta.division === division;
        });

        if (!matchingSession) {
            return res.json({ session: null });
        }

        // 3. Check if already marked
        const attendance = await db.get(
            "SELECT * FROM attendance WHERE session_id = ? AND student_id = ?",
            [matchingSession.id, id]
        );

        res.json({
            session: {
                id: matchingSession.id,
                code: matchingSession.code, // In some modes we might hide this until they are close
                radius: matchingSession.radius,
                lat: matchingSession.lat,
                lng: matchingSession.lng,
                subject: JSON.parse(matchingSession.metadata).subject
            },
            alreadyMarked: !!attendance
        });

    } catch (error) {
        console.error('Check Active Session Error:', error);
        res.status(500).json({ error: 'Failed to check active sessions' });
    }
});

module.exports = router;

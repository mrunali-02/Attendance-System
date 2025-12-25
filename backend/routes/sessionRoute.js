const express = require('express');
const router = express.Router();
const { initDB } = require('../db');

// Get session state with server-calculated remaining time
router.get('/:id/state', async (req, res) => {
    const { id } = req.params;
    const db = await initDB();

    try {
        const session = await db.get("SELECT * FROM sessions WHERE id = ?", [id]);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        const remainingMs = expiresAt - now;
        const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

        // Auto-close if expired
        if (remainingSeconds === 0 && session.status === 'ACTIVE') {
            await closeSession(db, id);
            session.status = 'CLOSED';
        }

        // Get attendance count
        const { count } = await db.get(
            "SELECT COUNT(*) as count FROM attendance WHERE session_id = ?",
            [id]
        );

        res.json({
            sessionId: session.id,
            code: session.code,
            status: session.status,
            active: session.status === 'ACTIVE',
            remainingSeconds,
            expiresAt: session.expires_at,
            markedCount: count || 0,
            metadata: session.metadata ? JSON.parse(session.metadata) : {}
        });

    } catch (error) {
        console.error('Get session state error:', error);
        res.status(500).json({ error: 'Failed to get session state' });
    }
});

// Get teacher's session history
router.get('/teacher/:teacherId/sessions', async (req, res) => {
    const { teacherId } = req.params;
    const db = await initDB();

    try {
        const sessions = await db.all(`
      SELECT 
        s.id,
        s.code,
        s.created_at,
        s.expires_at,
        s.ended_at,
        s.status,
        s.metadata,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
        COUNT(a.id) as total_marked
      FROM sessions s
      LEFT JOIN attendance a ON s.id = a.session_id
      WHERE s.teacher_id = ?
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `, [teacherId]);

        // Parse metadata for each session
        const formattedSessions = sessions.map(session => {
            const metadata = session.metadata ? JSON.parse(session.metadata) : {};
            return {
                ...session,
                year: metadata.year,
                branch: metadata.branch,
                division: metadata.division,
                subject: metadata.subject || 'N/A',
                totalStudents: metadata.totalStudents || 0
            };
        });

        res.json({ sessions: formattedSessions });

    } catch (error) {
        console.error('Get teacher sessions error:', error);
        res.status(500).json({ error: 'Failed to get sessions' });
    }
});

// Export attendance records for a session as CSV
router.get('/:id/export', async (req, res) => {
    const { id } = req.params;
    const db = await initDB();

    try {
        const session = await db.get("SELECT * FROM sessions WHERE id = ?", [id]);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Get all attendance records with student details
        const records = await db.all(`
      SELECT 
        u.name as student_name,
        u.email as student_email,
        a.status,
        a.marked_at,
        s.created_at as session_date
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN sessions s ON a.session_id = s.id
      WHERE a.session_id = ?
      ORDER BY u.name
    `, [id]);

        // Parse metadata for session details
        const metadata = session.metadata ? JSON.parse(session.metadata) : {};

        // Create CSV content
        let csv = 'Student Name,Email,Status,Marked At,Session Date,Year,Branch,Division\n';

        records.forEach(record => {
            csv += `"${record.student_name}","${record.student_email}","${record.status}","${record.marked_at || 'N/A'}","${record.session_date}","${metadata.year || ''}","${metadata.branch || ''}","${metadata.division || ''}"\n`;
        });

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="attendance_session_${id}_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);

    } catch (error) {
        console.error('Export attendance error:', error);
        res.status(500).json({ error: 'Failed to export attendance' });
    }
});

// Get active session for a teacher (for session recovery)
router.get('/active/:teacherId', async (req, res) => {
    const { teacherId } = req.params;
    const db = await initDB();

    try {
        const session = await db.get(
            "SELECT * FROM sessions WHERE teacher_id = ? AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1",
            [teacherId]
        );

        if (!session) {
            return res.status(404).json({ error: 'No active session found' });
        }

        res.json({ session });

    } catch (error) {
        console.error('Get active session error:', error);
        res.status(500).json({ error: 'Failed to get active session' });
    }
});

// Manually end session and generate attendance records
router.post('/:id/end', async (req, res) => {
    const { id } = req.params;
    const db = await initDB();

    try {
        const session = await db.get("SELECT * FROM sessions WHERE id = ?", [id]);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.status === 'CLOSED') {
            return res.status(400).json({ error: 'Session already closed' });
        }

        await closeSession(db, id);

        res.json({
            message: 'Session ended successfully',
            sessionId: id
        });

    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({ error: 'Failed to end session' });
    }
});

// Helper function to close session and generate records
async function closeSession(db, sessionId) {
    const session = await db.get("SELECT * FROM sessions WHERE id = ?", [sessionId]);

    if (!session || session.status === 'CLOSED') {
        return;
    }

    // Update session status
    await db.run(
        "UPDATE sessions SET status = 'CLOSED', active = 0, ended_at = CURRENT_TIMESTAMP WHERE id = ?",
        [sessionId]
    );

    // Parse metadata to get class info
    const metadata = session.metadata ? JSON.parse(session.metadata) : {};
    const { year, branch, division } = metadata;

    if (!year || !branch || !division) {
        console.warn('Session metadata incomplete, skipping auto-record generation');
        return;
    }

    // Get all enrolled students for this class
    const enrolledStudents = await db.all(
        `SELECT DISTINCT student_id FROM enrolled_students 
     WHERE year = ? AND branch = ? AND division = ?`,
        [year, branch, division]
    );

    // Get students who already marked attendance
    const presentStudents = await db.all(
        "SELECT student_id FROM attendance WHERE session_id = ?",
        [sessionId]
    );

    const presentIds = new Set(presentStudents.map(s => s.student_id));

    // Generate ABSENT records for students who didn't mark attendance
    for (const student of enrolledStudents) {
        if (!presentIds.has(student.student_id)) {
            try {
                await db.run(
                    "INSERT INTO attendance (session_id, student_id, status, marked_at) VALUES (?, ?, 'absent', NULL)",
                    [sessionId, student.student_id]
                );
            } catch (err) {
                // Ignore duplicate errors (MySQL: 1062, SQLite: 19)
                if (err.errno !== 19 && err.errno !== 1062) {
                    console.error('Error creating absent record:', err);
                }
            }
        }
    }

    console.log(`Session ${sessionId} closed. Generated attendance records.`);
}

module.exports = router;

const express = require('express');
const router = express.Router();
const { initDB } = require('../db');
const bcrypt = require('bcryptjs');

// Middleware to check if user is Admin (Placeholder for now)
const isAdmin = (req, res, next) => {
    // In a real app, we would check req.user.role === 'admin'
    // For now, we assume the route is protected by verifyToken in server.js or check manually
    next();
};

// Create Teacher
router.post('/create-teacher', isAdmin, async (req, res) => {
    const { name, email, password, branch } = req.body;

    if (!name || !email || !password || !branch) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const db = await initDB();

    try {
        // Check if email already exists
        const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Create User
        const userResult = await db.run(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'teacher')",
            [name, email, hashedPassword]
        );
        const userId = userResult.lastID;

        // 2. Create Teacher Profile
        await db.run(
            "INSERT INTO teachers (user_id, branch) VALUES (?, ?)",
            [userId, branch]
        );

        res.status(201).json({ message: 'Teacher created successfully', userId });

    } catch (error) {
        console.error('Create Teacher Error:', error);
        res.status(500).json({ error: 'Failed to create teacher account' });
    }
});

// Create Student
router.post('/create-student', isAdmin, async (req, res) => {
    const { name, email, password, branch, year, division } = req.body;

    if (!name || !email || !password || !branch || !year || !division) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const db = await initDB();

    try {
        // Check if email already exists
        const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Create User
        const userResult = await db.run(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')",
            [name, email, hashedPassword]
        );
        const userId = userResult.lastID;

        // 2. Create Student Profile (Enrolled)
        await db.run(
            "INSERT INTO enrolled_students (student_id, year, branch, division) VALUES (?, ?, ?, ?)",
            [userId, year, branch, division]
        );

        res.status(201).json({ message: 'Student created successfully', userId });

    } catch (error) {
        console.error('Create Student Error:', error);
        res.status(500).json({ error: 'Failed to create student account' });
    }
});

// Get All Teachers
router.get('/teachers', isAdmin, async (req, res) => {
    const db = await initDB();
    try {
        const teachers = await db.all(`
            SELECT u.id, u.name, u.email, u.created_at, t.branch 
            FROM users u 
            JOIN teachers t ON u.id = t.user_id 
            WHERE u.role = 'teacher'
            ORDER BY u.created_at DESC
        `);
        res.json(teachers);
    } catch (error) {
        console.error('Fetch Teachers Error:', error);
        res.status(500).json({ error: 'Failed to fetch teachers' });
    }
});

// Get All Students
router.get('/students', isAdmin, async (req, res) => {
    const db = await initDB();
    try {
        const students = await db.all(`
            SELECT u.id, u.name, u.email, u.created_at, e.branch, e.year, e.division
            FROM users u 
            JOIN enrolled_students e ON u.id = e.student_id 
            WHERE u.role = 'student'
            ORDER BY u.created_at DESC
        `);
        res.json(students);
    } catch (error) {
        console.error('Fetch Students Error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Delete User (Teacher or Student)
router.delete('/user/:id/:role', isAdmin, async (req, res) => {
    const { id, role } = req.params;
    const db = await initDB();

    try {
        if (role === 'student') {
            // 1. Delete Attendance Records
            await db.run("DELETE FROM attendance WHERE student_id = ?", [id]);
            // 2. Delete Enrollment
            await db.run("DELETE FROM enrolled_students WHERE student_id = ?", [id]);
            // 3. Delete User
            await db.run("DELETE FROM users WHERE id = ?", [id]);

        } else if (role === 'teacher') {
            // 1. Find all sessions by teacher
            const sessions = await db.all("SELECT id FROM sessions WHERE teacher_id = ?", [id]);

            // 2. Delete all attendance for those sessions
            for (const session of sessions) {
                await db.run("DELETE FROM attendance WHERE session_id = ?", [session.id]);
            }

            // 3. Delete Sessions
            await db.run("DELETE FROM sessions WHERE teacher_id = ?", [id]);
            // 4. Delete Teacher Profile
            await db.run("DELETE FROM teachers WHERE user_id = ?", [id]);
            // 5. Delete User
            await db.run("DELETE FROM users WHERE id = ?", [id]);
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;

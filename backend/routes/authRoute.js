const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDB } = require('../db');

// Login Route
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    const db = await initDB();

    try {
        const user = await db.get("SELECT * FROM users WHERE email = ? AND role = ?", [email, role]);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials or role' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Password Route (Protected)
router.put('/update-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    const db = await initDB();

    try {
        const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

module.exports = router;

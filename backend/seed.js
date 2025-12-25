const { initDB } = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
    const db = await initDB();

    try {
        const password = await bcrypt.hash('password123', 10);

        // Seed Teacher
        await db.run(
            "INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['John Teacher', 'teacher@college.edu', password, 'teacher']
        );

        // Seed Student
        await db.run(
            "INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['Jane Student', 'student@college.edu', password, 'student']
        );

        // Seed Student with Roll No as Email for simplicity as per login logic
        await db.run(
            "INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['Student 2023001', '2023001', password, 'student']
        );

        console.log('Seeding complete.');
    } catch (err) {
        console.error('Seeding failed:', err);
    }
}

seed();

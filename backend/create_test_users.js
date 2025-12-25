const { initDB } = require('./db');
const bcrypt = require('bcryptjs');

async function createManualTestUsers() {
    const db = await initDB();
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating manual test users...');

    try {
        // 1. Teacher (CSE)
        const tEmail = 'test.teacher@college.edu';
        // Delete if exists to avoid dupes
        await db.run("DELETE FROM users WHERE email = ?", [tEmail]);

        const tRes = await db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'teacher')", ['Test Teacher', tEmail, hashedPassword]);
        await db.run("INSERT INTO teachers (user_id, branch) VALUES (?, 'CSE')", [tRes.lastID]);
        console.log(`Created Teacher: ${tEmail}`);

        // 2. Valid Student (CSE, TE, A)
        const s1Email = 'test.student.valid@college.edu';
        await db.run("DELETE FROM users WHERE email = ?", [s1Email]);

        const s1Res = await db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')", ['Valid CSE Student', s1Email, hashedPassword]);
        await db.run("INSERT INTO enrolled_students (student_id, year, branch, division) VALUES (?, 'TE', 'CSE', 'A')", [s1Res.lastID]);
        console.log(`Created Valid Student: ${s1Email}`);

        // 3. Invalid Student (IT, TE, A)
        const s2Email = 'test.student.invalid@college.edu';
        await db.run("DELETE FROM users WHERE email = ?", [s2Email]);

        const s2Res = await db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')", ['Invalid IT Student', s2Email, hashedPassword]);
        await db.run("INSERT INTO enrolled_students (student_id, year, branch, division) VALUES (?, 'TE', 'IT', 'A')", [s2Res.lastID]);
        console.log(`Created Invalid Student: ${s2Email}`);

        console.log('\n--- Credentials ---');
        console.log(`Password for all: ${password}`);
        process.exit(0);

    } catch (error) {
        console.error('Failed', error);
        process.exit(1);
    }
}

createManualTestUsers();

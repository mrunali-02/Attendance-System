const { initDB } = require('./db');
const bcrypt = require('bcryptjs');

async function seedEnrolled() {
    const db = await initDB();

    try {
        console.log('Seeding database...');

        // Clear existing data
        await db.run("DELETE FROM enrolled_students");

        // Create/Ensure Teacher
        const existingTeacher = await db.get("SELECT * FROM users WHERE email = ?", ['teacher@college.edu']);
        if (!existingTeacher) {
            const hash = await bcrypt.hash('password123', 10);
            await db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                ['Faculty Member', 'teacher@college.edu', hash, 'teacher']
            );
            console.log('Created teacher account');
        }

        // Create/Ensure Student
        const existingStudent = await db.get("SELECT * FROM users WHERE email = ?", ['student@college.edu']);
        let studentId;

        if (!existingStudent) {
            const hash = await bcrypt.hash('password123', 10);
            const result = await db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                ['Student One', 'student@college.edu', hash, 'student']
            );
            studentId = result.lastID;
            console.log('Created student account');
        } else {
            studentId = existingStudent.id;
        }

        // Enroll students in various classes
        const classes = [
            { year: 'TE', branch: 'CSE', division: 'A' },
            { year: 'TE', branch: 'CSE', division: 'B' },
            { year: 'BE', branch: 'IT', division: 'A' }
        ];

        for (const cls of classes) {
            await db.run(
                "INSERT INTO enrolled_students (student_id, year, branch, division) VALUES (?, ?, ?, ?)",
                [studentId, cls.year, cls.branch, cls.division]
            );
        }

        // Add a few more mock students
        for (let i = 1; i <= 5; i++) {
            const email = `student${i}@college.edu`;
            const exists = await db.get("SELECT * FROM users WHERE email = ?", [email]);
            if (!exists) {
                const hash = await bcrypt.hash('password123', 10);
                const res = await db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                    [`Student ${i}`, email, hash, 'student']
                );

                // Enroll in TE CSE A
                await db.run(
                    "INSERT INTO enrolled_students (student_id, year, branch, division) VALUES (?, ?, ?, ?)",
                    [res.lastID, 'TE', 'CSE', 'A']
                );
            }
        }

        console.log('Seeding complete!');
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedEnrolled();

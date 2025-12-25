const { initDB } = require('./db');

async function clearData() {
    const db = await initDB();

    try {
        console.log('Clearing database of fake data...');

        // 1. Delete all enrolled students data
        await db.run("DELETE FROM enrolled_students");
        console.log('Cleared enrolled_students table.');

        // 2. Delete all teachers profile data
        await db.run("DELETE FROM teachers");
        console.log('Cleared teachers table.');

        // 3. Delete all attendance records (optional but good for cleanup)
        // Check if table exists first or just try-catch if worried, but DB.js creates it.
        await db.run("DELETE FROM attendance");
        console.log('Cleared attendance records.');

        // 4. Delete all sessions
        await db.run("DELETE FROM sessions");
        console.log('Cleared sessions.');

        // 5. Delete all users EXCEPT admin
        // Assuming admin email is 'admin@college.edu'
        const result = await db.run("DELETE FROM users WHERE role != 'admin'");
        console.log(`Deleted ${result.changes} user accounts (students and teachers).`);

        console.log('Cleanup complete! Only Admin account remains.');
        process.exit(0);

    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

clearData();

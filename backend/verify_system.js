const { initDB } = require('./db');

async function verifySystem() {
    console.log('--- System Verification (MySQL) ---');
    const db = await initDB();

    const tables = ['users', 'sessions', 'attendance', 'enrolled_students', 'teachers'];

    try {
        for (const table of tables) {
            const result = await db.get(`SELECT count(*) as count FROM ${table}`);
            console.log(`[OK] Table ${table}: ${result ? result.count : 0} rows`);
        }

        // Check specifically for the teacher user
        const teacher = await db.get("SELECT * FROM users WHERE email = 'teacher@college.edu'");
        if (teacher) {
            console.log(`[OK] Teacher user found: ID ${teacher.id}, Email ${teacher.email}`);

            // Check sessions table schema
            const columns = await db.all("SHOW COLUMNS FROM sessions");
            console.log("Sessions Table Schema:", columns.map(c => c.Field));

            const hasMetadata = columns.some(c => c.Field === 'metadata');
            const hasStatus = columns.some(c => c.Field === 'status');

            if (!hasMetadata || !hasStatus) {
                console.log("[CRITICAL] Schema mismatch! Missing columns.");
            } else {
                console.log("[OK] Schema looks correct.");
                const sessions = await db.all("SELECT id, teacher_id, status FROM sessions ORDER BY created_at DESC LIMIT 5");
                console.log("Session Data:", sessions);
            }
        } else {
            console.log('[WARN] Teacher user NOT found (This is expected if fresh DB)');
        }

    } catch (err) {
        console.error("Verification failed:", err);
    } finally {
        process.exit(0);
    }
}

verifySystem();

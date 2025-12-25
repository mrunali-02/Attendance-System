const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const tables = ['users', 'sessions', 'attendance', 'enrolled_students'];

console.log('--- System Verification ---');

db.serialize(() => {
    tables.forEach(table => {
        db.get(`SELECT count(*) as count FROM ${table}`, (err, row) => {
            if (err) {
                console.log(`[ERROR] Table ${table}: ${err.message}`);
            } else {
                console.log(`[OK] Table ${table}: ${row.count} rows`);
            }
        });
    });

    // Check specifically for the teacher user
    db.get("SELECT * FROM users WHERE email = 'teacher@college.edu'", (err, row) => {
        if (err) console.log(err);
        if (row) {
            console.log(`[OK] Teacher user found: ID ${row.id}, Email ${row.email}`);

            // Check all sessions to see who owns them
            // Check schema of sessions table
            db.all("PRAGMA table_info(sessions)", (err, rows) => {
                if (err) console.log(err);
                console.log("Sessions Table Schema:", rows);

                const hasMetadata = rows.some(r => r.name === 'metadata');
                const hasStatus = rows.some(r => r.name === 'status');

                if (!hasMetadata || !hasStatus) {
                    console.log("[CRITICAL] Schema mismatch! Missing columns.");
                    console.log(`Has metadata: ${hasMetadata}, Has status: ${hasStatus}`);
                } else {
                    console.log("[OK] Schema looks correct.");

                    // If schema is correct, check session data
                    db.all("SELECT id, teacher_id, status FROM sessions ORDER BY created_at DESC LIMIT 5", (err, sessions) => {
                        console.log("Session Data:", sessions);
                    });
                }
            });
        } else {
            console.log('[ERROR] Teacher user NOT found');
        }
    });
});

setTimeout(() => {
    db.close();
}, 2000);

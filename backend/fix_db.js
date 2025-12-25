const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- Database Migration ---');

db.serialize(() => {
    // Add status column
    db.run("ALTER TABLE sessions ADD COLUMN status TEXT DEFAULT 'ACTIVE'", (err) => {
        if (err) {
            if (err.message.includes('duplicate column')) {
                console.log("[INFO] status column already exists");
            } else {
                console.log("[ERROR] Failed to add status column:", err.message);
            }
        } else {
            console.log("[SUCCESS] Added status column");
        }
    });

    // Add ended_at column
    db.run("ALTER TABLE sessions ADD COLUMN ended_at DATETIME", (err) => {
        if (err) {
            if (err.message.includes('duplicate column')) {
                console.log("[INFO] ended_at column already exists");
            } else {
                console.log("[ERROR] Failed to add ended_at column:", err.message);
            }
        } else {
            console.log("[SUCCESS] Added ended_at column");
        }
    });

    // Verify
    db.all("PRAGMA table_info(sessions)", (err, rows) => {
        if (err) console.log(err);
        const hasStatus = rows.some(r => r.name === 'status');
        const hasEnded = rows.some(r => r.name === 'ended_at');
        console.log(`Verification - Has status: ${hasStatus}, Has ended_at: ${hasEnded}`);
    });
});

setTimeout(() => {
    db.close();
}, 2000);

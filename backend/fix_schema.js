const { initDB } = require('./db');

async function fixSchema() {
    console.log('--- Fixing Schema ---');
    const db = await initDB();

    try {
        // Increase branch column size to 255
        await db.run("ALTER TABLE teachers MODIFY COLUMN branch VARCHAR(255)");
        console.log("[SUCCESS] Updated teachers table branch column to VARCHAR(255)");

        // Also check/update enrolled_students branch just in case
        await db.run("ALTER TABLE enrolled_students MODIFY COLUMN branch VARCHAR(255)");
        console.log("[SUCCESS] Updated enrolled_students table branch column to VARCHAR(255)");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit(0);
    }
}

fixSchema();

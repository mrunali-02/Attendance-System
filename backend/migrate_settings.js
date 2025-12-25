const { initDB } = require('./db');

async function migrateSettings() {
    console.log('--- Migrating Database for Student Settings ---');
    const db = await initDB();

    try {
        // 1. Add token_version to users table
        try {
            await db.run("ALTER TABLE users ADD COLUMN token_version INT DEFAULT 1");
            console.log("[SUCCESS] Added token_version to users table");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("[INFO] token_version already exists in users table");
            } else {
                console.error("[ERROR] Failed to add token_version:", err.message);
            }
        }

        // 2. Create student_settings table
        await db.run(`
            CREATE TABLE IF NOT EXISTS student_settings (
                user_id INT PRIMARY KEY,
                theme VARCHAR(20) DEFAULT 'system',
                text_size VARCHAR(10) DEFAULT 'medium',
                notifications_start BOOLEAN DEFAULT 1,
                notifications_end BOOLEAN DEFAULT 1,
                show_profile_photo BOOLEAN DEFAULT 1,
                attendance_threshold INT DEFAULT 75,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("[SUCCESS] Verified student_settings table");

        // 3. Create support_requests table
        await db.run(`
            CREATE TABLE IF NOT EXISTS support_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                description TEXT NOT NULL,
                status ENUM('open', 'resolved', 'closed') DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("[SUCCESS] Verified support_requests table");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit(0);
    }
}

migrateSettings();

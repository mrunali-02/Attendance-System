const { initDB } = require('./db');

async function checkData() {
    console.log('--- Checking Database Data ---');
    const db = await initDB();

    const tables = ['users', 'teachers', 'enrolled_students', 'sessions'];

    for (const table of tables) {
        console.log(`\n=== DATA IN ${table.toUpperCase()} ===`);
        const rows = await db.all(`SELECT * FROM ${table} LIMIT 100`); // Safety limit
        if (rows.length === 0) {
            console.log("No data found.");
        } else {
            console.table(rows);
        }
    }

    process.exit(0);
}

checkData();

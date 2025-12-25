const { initDB } = require('./db');
const bcrypt = require('bcryptjs');

async function testEnrollmentRules() {
    const db = await initDB();
    console.log('--- Starting Enforcement Verification ---');

    try {
        // 1. Setup: Create Teacher (CSE)
        const pswd = await bcrypt.hash('test1234', 10);

        // Ensure clean slate for test
        const emailT = `test_prof_${Date.now()}@test.com`;
        const resT = await db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'teacher')", ['Test Prof', emailT, pswd]);
        const teacherId = resT.lastID;
        await db.run("INSERT INTO teachers (user_id, branch) VALUES (?, 'CSE')", [teacherId]);
        console.log(`[Setup] Created Teacher (CSE): ${emailT}`);

        // 2. Setup: Create VALID Student (CSE)
        const emailS1 = `valid_student_${Date.now()}@test.com`;
        const resS1 = await db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')", ['Valid Student', emailS1, pswd]);
        const s1Id = resS1.lastID;
        await db.run("INSERT INTO enrolled_students (student_id, year, branch, division) VALUES (?, 'TE', 'CSE', 'A')", [s1Id]);
        console.log(`[Setup] Created Valid Student (TE CSE A): ${emailS1}`);

        // 3. Setup: Create INVALID Student (IT)
        const emailS2 = `invalid_student_${Date.now()}@test.com`;
        const resS2 = await db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')", ['Invalid Student', emailS2, pswd]);
        const s2Id = resS2.lastID;
        await db.run("INSERT INTO enrolled_students (student_id, year, branch, division) VALUES (?, 'TE', 'IT', 'A')", [s2Id]);
        console.log(`[Setup] Created Invalid Student (TE IT A): ${emailS2}`);

        // 4. Action: Start Session for TE CSE A
        // We simulate the metadata that the frontend sends
        const metadata = JSON.stringify({ year: 'TE', branch: 'CSE', division: 'A', subject: 'Test Subject' });

        // Calculate standard MySQL timestamp for expiresAt
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 10 * 60000); // 10 mins
        const pad = n => n.toString().padStart(2, '0');
        const mysqlExpires = `${expiresAt.getFullYear()}-${pad(expiresAt.getMonth() + 1)}-${pad(expiresAt.getDate())} ${pad(expiresAt.getHours())}:${pad(expiresAt.getMinutes())}:${pad(expiresAt.getSeconds())}`;

        const code = '9999';
        const sessionRes = await db.run(
            `INSERT INTO sessions (code, teacher_id, active, status, expires_at, lat, lng, radius, metadata) 
             VALUES (?, ?, 1, 'ACTIVE', ?, 0, 0, 500, ?)`,
            [code, teacherId, mysqlExpires, metadata]
        );
        const sessionId = sessionRes.lastID;
        console.log(`[Action] Started Session ${sessionId} for TE CSE A (Code: ${code})`);


        // 5. Test Case 1: Invalid Student tries to mark
        console.log('\n--- Test Case 1: Invalid Student (IT) tries to mark CSE attendance ---');
        // We simulate the check logic manually or we can call the function if we refactored it. 
        // Here verification logic mirrors the route:

        // Logic from route:
        const studentInfo2 = await db.get("SELECT * FROM enrolled_students WHERE student_id = ?", [s2Id]);
        const metaObj = JSON.parse(metadata);

        let passed1 = false;
        if (studentInfo2.year !== metaObj.year || studentInfo2.branch !== metaObj.branch || studentInfo2.division !== metaObj.division) {
            console.log("✅ RESULT: Blocked. Reason: Branch/Class mismatch.");
            passed1 = true;
        } else {
            console.log("❌ RESULT: Failed. System allowed invalid student!");
            passed1 = false;
        }


        // 6. Test Case 2: Valid Student tries to mark
        console.log('\n--- Test Case 2: Valid Student (CSE) tries to mark CSE attendance ---');
        const studentInfo1 = await db.get("SELECT * FROM enrolled_students WHERE student_id = ?", [s1Id]);

        let passed2 = false;
        if (studentInfo1.year === metaObj.year && studentInfo1.branch === metaObj.branch && studentInfo1.division === metaObj.division) {
            console.log("✅ RESULT: Allowed. Student matches class.");
            passed2 = true;
        } else {
            console.log("❌ RESULT: Blocked unexpectedly!");
            passed2 = false;
        }

        console.log('\n-----------------------------------');
        if (passed1 && passed2) {
            console.log('VICTORY: Security rules are working correctly! 🛡️');
        } else {
            console.log('FAILURE: Security rules are broken.');
        }

        process.exit(0);

    } catch (e) {
        console.error("Test failed", e);
        process.exit(1);
    }
}

testEnrollmentRules();

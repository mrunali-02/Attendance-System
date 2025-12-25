const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

let pool;

async function initDB() {
  if (pool) return pool;

  try {
    // Create connection pool
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'attendance_system',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('Connected to MySQL database.');

    // Create Tables using MySQL syntax
    const connection = await pool.getConnection();

    try {
      await connection.query(`
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('student', 'teacher', 'admin') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

      await connection.query(`
          CREATE TABLE IF NOT EXISTS sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(10) NOT NULL,
            teacher_id INT NOT NULL,
            active BOOLEAN DEFAULT 1,
            status ENUM('ACTIVE', 'CLOSED') DEFAULT 'ACTIVE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NULL,
            ended_at TIMESTAMP NULL,
            lat DECIMAL(10, 8),
            lng DECIMAL(11, 8),
            radius DECIMAL(10, 2) DEFAULT 50.00,
            metadata TEXT,
            FOREIGN KEY (teacher_id) REFERENCES users(id)
          )
        `);

      await connection.query(`
          CREATE TABLE IF NOT EXISTS attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            student_id INT NOT NULL,
            marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) DEFAULT 'present',
            FOREIGN KEY (session_id) REFERENCES sessions(id),
            FOREIGN KEY (student_id) REFERENCES users(id),
            UNIQUE KEY unique_attendance (session_id, student_id)
          )
        `);

      await connection.query(`
          CREATE TABLE IF NOT EXISTS enrolled_students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            year VARCHAR(10),
            branch VARCHAR(50),
            division VARCHAR(5),
            FOREIGN KEY (student_id) REFERENCES users(id)
          )
        `);

      // Check if admin user exists, if not create one
      const [rows] = await connection.query("SELECT * FROM users WHERE email = ?", ['admin@college.edu']);
      if (rows.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          ['Admin User', 'admin@college.edu', hashedPassword, 'admin']
        );
        console.log('Admin user created');
      }

    } finally {
      connection.release();
    }

    // Add helper methods to match SQLite API style for compatibility
    pool.get = async (sql, params) => {
      const [rows] = await pool.execute(sql, params);
      return rows[0];
    };

    pool.all = async (sql, params) => {
      const [rows] = await pool.execute(sql, params);
      return rows;
    };

    pool.run = async (sql, params) => {
      const [result] = await pool.execute(sql, params);
      return { lastID: result.insertId, changes: result.affectedRows };
    };

    return pool;

  } catch (error) {
    console.error('Database initialization failed:', error);
    if (error.code === 'ECONNREFUSED') {
      console.error('Please make sure MySQL is running and credentials in .env are correct.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`Database '${process.env.DB_NAME}' does not exist. Please create it manually in MySQL.`);
    }
    throw error;
  }
}

module.exports = { initDB };

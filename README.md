# Smart Attendance System

A modern, geolocation-based attendance management system built for educational institutions. This system allows teachers to launch attendance sessions and students to mark their presence within a specific radius using their devices.

## 🚀 Tech Stack

### Frontend
- **React.js** (Vite) - UI Library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router DOM** - Navigation

### Backend
- **Node.js & Express** - Server Framework
- **MySQL** - Database
- **JWT (JSON Web Tokens)** - Authentication
- **Bcrypt.js** - Password Hashing

---

## 📂 Project Structure

```
C:\Attendance System\
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Application pages (Dashboards, Login, Settings)
│   │   └── ...
├── backend/            # Express backend server
│   ├── routes/         # API Route handlers
│   ├── db.js           # Database connection & initialization
│   └── server.js       # Entry point
├── database/           # Database migration/backup files (no longer holds SQLite)
├── package.json        # Root configuration for Monorepo
└── README.md           # Project Documentation
```

---

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js** (v16+)
- **MySQL Server** (Running and accessible)

### 1. Clone & Install Dependencies
Run the following command in the root directory to install dependencies for both frontend and backend:

```bash
npm install
npm run install:all
```

### 2. Database Configuration
1.  Ensure your MySQL server is running.
2.  Create a database (default name: `attendance_system`) or let the system create it.
3.  Navigate to `backend/` and create a `.env` file:

```env
# backend/.env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=attendance_system
JWT_SECRET=your_jwt_secret_key
```

### 3. Initialize Database
The system automatically creates necessary tables on the first run.
To manually verify or migrate schema, you can run:
```bash
cd backend
node migrate_settings.js
```

---

## ▶️ Running the Application

You can start the entire system from the **root directory**:

### Start Frontend
```bash
npm run start:frontend
```
*Access at: `http://localhost:5173`*

### Start Backend
```bash
npm run start:backend
```
*Server runs at: `http://localhost:5000`*

---

## 📱 Application Flow

### 1. Teacher Workflow
1.  **Login**: Enter teacher credentials (e.g., `teacher@college.edu`).
2.  **Dashboard**: You will see fields to enter specific Session Details (Subject, Year, Branch, Division).
3.  **Launch Session**: Click "Launch Session". This captures your current geolocation as the class center.
4.  **Monitor**: A Live Attendance Counter appears. Share the session duration with students (default 2 minutes).
5.  **Logs**: After the session ends, check "Attendance Logs" for a full report.

### 2. Student Workflow
1.  **Login**: Enter student credentials.
2.  **Mark Attendance**: Navigate to "Mark Attendance".
3.  **Verification**: Click "Mark Present". The system checks:
    - If a session is active for your batch.
    - If you are physically within the 50m radius of the teacher.
4.  **Success**: You will see a success message.
5.  **History**: Check "History" to view your attendance record.

### 3. Student Settings
1.  **Navigate**: Click "Settings" in the sidebar.
2.  **Manage**: Update your password, toggle theme (Light/Dark), or adjust notification preferences.
3.  **Logout**: Use "Logout All Devices" to secure your account if logged in elsewhere.

---

## ✨ Key Features

### 🔐 Authentication
- Role-based login (Student, Teacher, Admin).
- Secure JWT sessions with "Logout from all devices" capability.

### 👨‍🏫 Teacher Dashboard
- **Launch Session**: Start a timed attendance session with a specific geolocation radius.
- **Live Monitoring**: View real-time attendance counts.
- **Session History**: View past logs and detailed reports.

### 🎓 Student Dashboard
- **Mark Attendance**: One-tap attendance marking (checks location & active session).
- **History**: View personal attendance records.
- **Settings**:
    - **Change Password**: Securely update credentials.
    - **Session Control**: Logout from all active devices.
    - **Notifications**: Start/End session alerts.
    - **Themes**: Light/Dark/System modes.
    - **Privacy**: Control profile visibility.

### 🛡️ Admin Dashboard
- Manage Users (Teachers, Students).
- View System Reports.

---

## 📡 API Documentation

### Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/logout-all` - Invalidate all sessions

### Attendance
- `POST /api/attendance/create` - Start session (Teacher)
- `POST /api/attendance/mark` - Mark attendance (Student)
- `GET /api/attendance/active` - Check active session

### Settings
- `GET /api/settings/:userId` - Fetch user preferences
- `POST /api/settings/update` - Update preferences
- `POST /api/settings/support` - Submit support ticket

---

## ❓ Troubleshooting

**1. "Email already registered" Error?**
- The system prevents duplicate emails. Check if the user already exists in the `users` table.

**2. "Data too long for column 'branch'"?**
- We have updated the schema to support longer branch names (VARCHAR 255). Run `node backend/fix_schema.js` if you encounter this.

**3. Geolocation Issues?**
- Ensure your browser has Location Permissions enabled.
- Ensure you are effectively within the radius (default 50m) of the teacher's device location.

**4. Database Connection Failed?**
- Verify MySQL is running.
- Check credentials in `backend/.env`.

---

*Documentation generated by Antigravity AI.*

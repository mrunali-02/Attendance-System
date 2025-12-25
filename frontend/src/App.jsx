import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentHistory from './pages/StudentHistory';
import AdminDashboard from './pages/AdminDashboard';
import AttendanceLogs from './pages/AttendanceLogs';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

import StudentSettings from './pages/StudentSettings';

function App() {
  React.useEffect(() => {
    // Apply theme on initial load
    const saved = JSON.parse(localStorage.getItem('teacherSettings') || '{}');
    if (saved.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/:role" element={<LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/logs" element={<AttendanceLogs />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />

        {/* Modular Student Routes */}
        <Route path="/student/mark" element={<StudentDashboard />} />
        <Route path="/student/history" element={<StudentHistory />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/settings" element={<StudentSettings />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Legacy/Direct Access Redirects */}
        <Route path="/student" element={<Navigate to="/student/mark" replace />} />
        <Route path="/student/dashboard" element={<Navigate to="/student/mark" replace />} />
        <Route path="/attendance" element={<Navigate to="/teacher/dashboard" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

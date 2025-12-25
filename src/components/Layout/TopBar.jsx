import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Bell } from 'lucide-react';

const TopBar = ({ title = "Dashboard", userRole = "Teacher" }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-3 shadow-sm flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Smart Attendance
        </h1>
        <span className="mx-2 text-gray-300 dark:text-slate-700">|</span>
        <span className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
          {userRole}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 dark:text-slate-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-200">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-slate-500">{userRole}</p>
          </div>
          <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-slate-700">
            <User size={20} className="text-gray-600 dark:text-slate-400" />
            {user?.name && <span className="sr-only">{user.name}</span>}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

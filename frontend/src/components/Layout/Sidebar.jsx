import React, { useState } from 'react';
import {
    LayoutDashboard,
    CheckCircle,
    ClipboardList,
    FileBarChart,
    UserCircle,
    Settings,
    ChevronLeft,
    ChevronRight,
    Menu
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ role = 'teacher' }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const teacherLinks = [
        { icon: CheckCircle, label: 'Start Attendance', path: '/attendance' },
        { icon: ClipboardList, label: 'Attendance Logs', path: '/logs' },
        { icon: FileBarChart, label: 'Reports', path: '/reports' },
        { icon: UserCircle, label: 'Profile', path: '/profile' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const studentLinks = [
        { icon: CheckCircle, label: 'Mark Attendance', path: '/student/mark' },
        { icon: ClipboardList, label: 'History', path: '/student/history' },
        { icon: UserCircle, label: 'Profile', path: '/student/profile' },
    ];

    const links = role === 'teacher' ? teacherLinks : studentLinks;

    return (
        <>
            {/* Mobile Trigger */}
            <button
                className="fixed bottom-4 right-4 z-50 p-3 bg-primary text-white rounded-full shadow-lg md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                <Menu size={24} />
            </button>

            {/* Sidebar Container */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-30 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:h-screen
          ${collapsed ? 'w-20' : 'w-64'}
          flex flex-col
        `}
            >
                {/* Toggle Button (Desktop) */}
                <div className="absolute -right-3 top-20 hidden md:flex">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-sm hover:text-primary transition-colors dark:text-slate-400"
                    >
                        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
                ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'}
              `}
                            title={collapsed ? link.label : ''}
                            end
                        >
                            <link.icon
                                size={22}
                                className={`flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`}
                            />
                            {!collapsed && (
                                <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                                    {link.label}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 space-y-2">
                    {/* Add any other footer actions if needed, e.g. Logout */}
                </div>
            </aside>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-20 md:hidden glass"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;

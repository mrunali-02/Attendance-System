import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Shield } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleRoleSelect = (role) => {
        navigate(`/login/${role}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-4xl w-full text-center space-y-12">
                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                        Smart Attendance System
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Select your role to continue to the dashboard.
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* Teacher Card */}
                    <button
                        onClick={() => handleRoleSelect('teacher')}
                        className="group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                            <BookOpen className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Teacher</h3>
                        <p className="text-sm text-slate-500">Access class management and start attendance</p>
                    </button>

                    {/* Student Card */}
                    <button
                        onClick={() => handleRoleSelect('student')}
                        className="group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                            <User className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Student</h3>
                        <p className="text-sm text-slate-500">Mark attendance and view history</p>
                    </button>

                    {/* Admin Card */}
                    <button
                        onClick={() => handleRoleSelect('admin')}
                        className="group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                            <Shield className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Admin Panel</h3>
                        <p className="text-sm text-slate-500">Manage users and system settings</p>
                    </button>
                </div>

                {/* Footer */}
                <div className="pt-8 text-sm text-slate-400">
                    &copy; {new Date().getFullYear()} College Administration. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

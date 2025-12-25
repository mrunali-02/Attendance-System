import React, { useState } from 'react';
import { Trash2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [isTeacherModalOpen, setIsTeacherModalOpen] = React.useState(false);
    const [isStudentModalOpen, setIsStudentModalOpen] = React.useState(false);
    const [teachers, setTeachers] = React.useState([]);
    const [students, setStudents] = React.useState([]);
    const [notification, setNotification] = React.useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const fetchUsers = async () => {
        try {
            const tRes = await fetch('/api/admin/teachers');
            if (tRes.ok) setTeachers(await tRes.json());

            const sRes = await fetch('/api/admin/students');
            if (sRes.ok) setStudents(await sRes.json());
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/admin/create-teacher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                showNotification('Teacher account created successfully');
                setIsTeacherModalOpen(false);
                fetchUsers(); // Refresh list
            } else {
                showNotification(result.error || 'Failed to create teacher', 'error');
            }
        } catch (error) {
            showNotification('Network error', 'error');
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/admin/create-student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                showNotification('Student account created successfully');
                setIsStudentModalOpen(false);
                fetchUsers(); // Refresh list
            } else {
                showNotification(result.error || 'Failed to create student', 'error');
            }
        } catch (error) {
            showNotification('Network error', 'error');
        }
    };

    const handleDeleteUser = async (id, role) => {
        if (!window.confirm(`Are you sure you want to delete this ${role}? This action cannot be undone.`)) return;

        try {
            const res = await fetch(`/api/admin/user/${id}/${role}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); // Added token just in case
            if (res.ok) {
                showNotification(`${role.charAt(0).toUpperCase() + role.slice(1)} deleted successfully`);
                fetchUsers();
            } else {
                showNotification("Failed to delete user", "error");
            }
        } catch (error) {
            showNotification("Network error", "error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                {notification && (
                    <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'} transition-all z-50`}>
                        {notification.message}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 text-slate-500 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Log Out</span>
                        </button>
                    </div>
                    <p className="text-slate-600 mb-8">
                        Welcome to the Administrator Panel. Manage users and system settings here.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col items-start">
                            <h3 className="font-semibold text-blue-900 mb-2">Teacher Management</h3>
                            <p className="text-blue-700 text-sm mb-4">Create and manage teacher accounts.</p>
                            <button
                                onClick={() => setIsTeacherModalOpen(true)}
                                className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Add Teacher
                            </button>
                        </div>
                        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex flex-col items-start">
                            <h3 className="font-semibold text-emerald-900 mb-2">Student Management</h3>
                            <p className="text-emerald-700 text-sm mb-4">Create and manage student accounts.</p>
                            <button
                                onClick={() => setIsStudentModalOpen(true)}
                                className="mt-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                            >
                                Add Student
                            </button>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                            <h3 className="font-semibold text-purple-900 mb-2">System Settings</h3>
                            <p className="text-purple-700 text-sm">Global configurations coming soon.</p>
                        </div>
                    </div>

                    {/* Teachers List */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Registered Teachers</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                                        <th className="p-4 border-b">Name</th>
                                        <th className="p-4 border-b">Email</th>
                                        <th className="p-4 border-b">Branch</th>
                                        <th className="p-4 border-b">Joined</th>
                                        <th className="p-4 border-b">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {teachers.length === 0 ? (
                                        <tr><td colSpan="5" className="p-4 text-center text-slate-500">No teachers found.</td></tr>
                                    ) : (
                                        teachers.map(teacher => (
                                            <tr key={teacher.id} className="border-b hover:bg-slate-50">
                                                <td className="p-4 font-medium">{teacher.name}</td>
                                                <td className="p-4">{teacher.email}</td>
                                                <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{teacher.branch}</span></td>
                                                <td className="p-4 text-sm">{new Date(teacher.created_at).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => handleDeleteUser(teacher.id, 'teacher')}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                        title="Delete Teacher"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Students List */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Registered Students</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                                        <th className="p-4 border-b">Name</th>
                                        <th className="p-4 border-b">Email</th>
                                        <th className="p-4 border-b">Branch</th>
                                        <th className="p-4 border-b">Year</th>
                                        <th className="p-4 border-b">Division</th>
                                        <th className="p-4 border-b">Joined</th>
                                        <th className="p-4 border-b">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {students.length === 0 ? (
                                        <tr><td colSpan="7" className="p-4 text-center text-slate-500">No students found.</td></tr>
                                    ) : (
                                        students.map(student => (
                                            <tr key={student.id} className="border-b hover:bg-slate-50">
                                                <td className="p-4 font-medium">{student.name}</td>
                                                <td className="p-4">{student.email}</td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">{student.branch}</span>
                                                </td>
                                                <td className="p-4">{student.year}</td>
                                                <td className="p-4">{student.division}</td>
                                                <td className="p-4 text-sm">{new Date(student.created_at).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => handleDeleteUser(student.id, 'student')}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                        title="Delete Student"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Teacher Modal */}
            {isTeacherModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">Create Teacher Account</h3>
                            <button onClick={() => setIsTeacherModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleCreateTeacher} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input name="name" type="text" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Dr. John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input name="email" type="email" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@college.edu" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                                <select name="branch" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">Select Branch</option>
                                    <option value="Civil Engineering">Civil Engineering</option>
                                    <option value="Civil & Infrastructure Engineering">Civil & Infrastructure Engineering</option>
                                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Computer Engineering">Computer Engineering</option>
                                    <option value="Artificial Intelligence and Data Science Engineering">Artificial Intelligence and Data Science Engineering</option>
                                    <option value="Electronics and Telecommunication Engineering">Electronics and Telecommunication Engineering</option>
                                    <option value="Chemical Engineering">Chemical Engineering</option>
                                    <option value="Humanities and Sciences">Humanities and Sciences</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input name="password" type="password" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Student Modal */}
            {isStudentModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">Create Student Account</h3>
                            <button onClick={() => setIsStudentModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input name="name" type="text" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Jane Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input name="email" type="email" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="jane@student.edu" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <select name="year" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                                        <option value="">Select</option>
                                        <option value="FE">FE</option>
                                        <option value="SE">SE</option>
                                        <option value="TE">TE</option>
                                        <option value="BE">BE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                                    <select name="division" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                                        <option value="">Select</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                                <select name="branch" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                                    <option value="">Select Branch</option>
                                    <option value="Civil Engineering">Civil Engineering</option>
                                    <option value="Civil & Infrastructure Engineering">Civil & Infrastructure Engineering</option>
                                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Computer Engineering">Computer Engineering</option>
                                    <option value="Artificial Intelligence and Data Science Engineering">Artificial Intelligence and Data Science Engineering</option>
                                    <option value="Electronics and Telecommunication Engineering">Electronics and Telecommunication Engineering</option>
                                    <option value="Chemical Engineering">Chemical Engineering</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input name="password" type="password" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="••••••••" />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

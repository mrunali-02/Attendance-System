import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { User, Mail, Lock, Shield } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Protect Route - Allow both teacher and student
    React.useEffect(() => {
        if (!user || (user.role !== 'teacher' && user.role !== 'student')) {
            navigate('/');
        }
    }, []);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        try {
            const response = await fetch('/api/auth/update-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: 'Password updated successfully' });
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update password' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error occurred' });
        }
    };

    return (
        <DashboardLayout role={user.role || 'teacher'}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-500">Manage your account information</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Public Info Card */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                <User size={40} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{user.name || 'Teacher'}</h2>
                            <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full uppercase">
                                {user.role || 'Teacher'}
                            </span>
                        </div>
                    </div>

                    {/* Details & Security */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Basic Info */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield size={18} className="text-gray-400" /> Account Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                                    <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                                        {user.name}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                                    <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 flex items-center gap-2">
                                        <Mail size={16} className="text-gray-400" />
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Password Update */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Lock size={18} className="text-gray-400" /> Security
                            </h3>

                            {message.text && (
                                <div className={`p-3 rounded-lg text-sm mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;

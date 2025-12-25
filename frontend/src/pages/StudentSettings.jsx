import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Bell, Moon, Sun, Eye, FileText, HelpCircle, LogOut, Save, Smartphone, Lock } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';

const StudentSettings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Settings State
    const [settings, setSettings] = useState({
        userId: null,
        theme: 'system',
        textSize: 'medium',
        notificationsStart: true,
        notificationsEnd: true,
        showProfilePhoto: true,
        attendanceThreshold: 75
    });

    // Password State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Support Form State
    const [supportForm, setSupportForm] = useState({
        type: 'technical',
        description: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) return navigate('/login/student');

        setSettings(prev => ({ ...prev, userId: user.id }));

        try {
            const res = await fetch(`/api/settings/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setSettings(prev => ({
                    ...prev,
                    theme: data.theme,
                    textSize: data.text_size,
                    notificationsStart: data.notifications_start === 1,
                    notificationsEnd: data.notifications_end === 1,
                    showProfilePhoto: data.show_profile_photo === 1,
                    attendanceThreshold: data.attendance_threshold
                }));
                applyTheme(data.theme);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = (theme) => {
        const root = document.documentElement;
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) root.classList.add('dark');
        else root.classList.remove('dark');
    };

    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        if (key === 'theme') applyTheme(value);
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) showMessage('Settings saved successfully', 'success');
            else showMessage('Failed to save settings', 'error');
        } catch (error) {
            showMessage('Network error', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return showMessage('New passwords do not match', 'error');
        }

        try {
            const res = await fetch('/api/auth/update-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: settings.userId,
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                showMessage(data.message, 'success');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                showMessage(data.error, 'error');
            }
        } catch (error) {
            showMessage('Network error', 'error');
        }
    };

    const handleLogoutAll = async () => {
        if (!window.confirm('Are you sure you want to log out from all devices?')) return;
        try {
            await fetch('/api/auth/logout-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: settings.userId })
            });
            localStorage.clear();
            navigate('/login/student');
        } catch (error) {
            showMessage('Failed to logout', 'error');
        }
    };

    const handleSupportSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/settings/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: settings.userId, ...supportForm })
            });

            if (res.ok) {
                showMessage('Support request submitted', 'success');
                setSupportForm({ type: 'technical', description: '' });
            } else {
                showMessage('Failed to submit request', 'error');
            }
        } catch (error) {
            showMessage('Network error', 'error');
        }
    };

    const showMessage = (msg, type) => {
        setMessage({ text: msg, type });
        setTimeout(() => setMessage(null), 3000);
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <DashboardLayout role="student">
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6 text-slate-800">Student Settings</h1>

                {message && (
                    <div className={`mb-4 p-4 rounded-lg text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-slate-50 border-r">
                        <nav className="flex flex-col p-4 space-y-1">
                            {[
                                { id: 'account', icon: Shield, label: 'Account & Security' },
                                { id: 'notifications', icon: Bell, label: 'Notifications' },
                                { id: 'appearance', icon: Sun, label: 'Appearance & Access' },
                                { id: 'privacy', icon: Eye, label: 'Privacy & Data' },
                                { id: 'support', icon: HelpCircle, label: 'Help & Support' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8">
                        {activeTab === 'account' && (
                            <div className="space-y-8 animate-in fade-in">
                                <div>
                                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <Lock size={20} /> Change Password
                                    </h2>
                                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                        <input
                                            type="password"
                                            placeholder="Current Password"
                                            className="w-full p-2 border rounded-lg"
                                            value={passwordForm.currentPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            className="w-full p-2 border rounded-lg"
                                            value={passwordForm.newPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            required
                                            minLength={8}
                                        />
                                        <input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            className="w-full p-2 border rounded-lg"
                                            value={passwordForm.confirmPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            required
                                        />
                                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Update Password</button>
                                    </form>
                                </div>
                                <div className="border-t pt-8">
                                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <Smartphone size={20} /> Session Management
                                    </h2>
                                    <p className="text-slate-600 mb-4">Log out from all devices including this one.</p>
                                    <button onClick={handleLogoutAll} className="flex items-center gap-2 text-red-600 border border-red-200 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100">
                                        <LogOut size={18} /> Logout All Devices
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6 animate-in fade-in">
                                <h2 className="text-xl font-semibold mb-4">Attendance Alerts</h2>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">Session Start</p>
                                        <p className="text-sm text-slate-500">Notify when attendance marking begins</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.notificationsStart}
                                        onChange={e => handleSettingChange('notificationsStart', e.target.checked)}
                                        className="h-5 w-5 accent-blue-600"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">Session Ending Soon</p>
                                        <p className="text-sm text-slate-500">Alert 10 seconds before session closes</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.notificationsEnd}
                                        onChange={e => handleSettingChange('notificationsEnd', e.target.checked)}
                                        className="h-5 w-5 accent-blue-600"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-6 animate-in fade-in">
                                <h2 className="text-xl font-semibold mb-4">Theme</h2>
                                <div className="grid grid-cols-3 gap-4">
                                    {['light', 'dark', 'system'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => handleSettingChange('theme', mode)}
                                            className={`p-4 border rounded-xl flex flex-col items-center gap-2 ${settings.theme === mode ? 'border-blue-500 bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}
                                        >
                                            {mode === 'light' ? <Sun /> : mode === 'dark' ? <Moon /> : <Smartphone />}
                                            <span className="capitalize">{mode}</span>
                                        </button>
                                    ))}
                                </div>

                                <h2 className="text-xl font-semibold mt-8 mb-4">Accessibility</h2>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Text Size</label>
                                    <select
                                        value={settings.textSize}
                                        onChange={e => handleSettingChange('textSize', e.target.value)}
                                        className="w-full p-2 border rounded-lg"
                                    >
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="space-y-6 animate-in fade-in">
                                <h2 className="text-xl font-semibold mb-4">Profile Visibility</h2>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">Show Profile Photo</p>
                                        <p className="text-sm text-slate-500">Visible to teachers in attendance logs</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settings.showProfilePhoto}
                                        onChange={e => handleSettingChange('showProfilePhoto', e.target.checked)}
                                        className="h-5 w-5 accent-blue-600"
                                    />
                                </div>
                                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm mt-4">
                                    <p className="font-bold flex items-center gap-2"><Eye size={16} /> Location Privacy</p>
                                    <p className="mt-1">Your location is only accessed when you actively mark attendance. We do not track your location in the background or store location history.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'support' && (
                            <div className="space-y-6 animate-in fade-in">
                                <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
                                <form onSubmit={handleSupportSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Issue Type</label>
                                        <select
                                            value={supportForm.type}
                                            onChange={e => setSupportForm({ ...supportForm, type: e.target.value })}
                                            className="w-full p-2 border rounded-lg"
                                        >
                                            <option value="technical">Technical Issue</option>
                                            <option value="attendance">Attendance Correction</option>
                                            <option value="account">Account Access</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <textarea
                                            value={supportForm.description}
                                            onChange={e => setSupportForm({ ...supportForm, description: e.target.value })}
                                            className="w-full p-2 border rounded-lg h-32"
                                            placeholder="Describe the issue..."
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900">Submit Request</button>
                                </form>

                                <div className="mt-8">
                                    <h3 className="font-semibold mb-2">FAQ</h3>
                                    <div className="space-y-2">
                                        <details className="bg-slate-50 p-4 rounded-lg">
                                            <summary className="font-medium cursor-pointer">Why did attendance fail?</summary>
                                            <p className="mt-2 text-sm text-slate-600">Ensure you are within the classroom radius and have enabled location permissions.</p>
                                        </details>
                                        <details className="bg-slate-50 p-4 rounded-lg">
                                            <summary className="font-medium cursor-pointer">Location Permission denied?</summary>
                                            <p className="mt-2 text-sm text-slate-600">Check your browser settings to allow location access for this site.</p>
                                        </details>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Save Button (Floating or Fixed) */}
                {['notifications', 'appearance', 'privacy'].includes(activeTab) && (
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium shadow-md transition-all"
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentSettings;

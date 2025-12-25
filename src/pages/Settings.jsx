import React, { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Moon, Sun, Clock, Bell, Monitor } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('teacherSettings');
        return saved ? JSON.parse(saved) : {
            darkMode: false,
            notifications: true,
            defaultDuration: '5',
            autoExport: false
        };
    });

    const saveSettings = (newSettings) => {
        setSettings(newSettings);
        localStorage.setItem('teacherSettings', JSON.stringify(newSettings));
        
        // Apply Dark Mode immediately
        if (newSettings.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleToggle = (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        saveSettings(newSettings);
    };

    const handleChange = (e) => {
        const newSettings = { ...settings, [e.target.name]: e.target.value };
        saveSettings(newSettings);
    };

    return (
        <DashboardLayout role="teacher">
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500">Customize your dashboard experience</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">

                    {/* Appearance */}
                    <div className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Monitor size={18} className="text-gray-400" /> Appearance
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Dark Mode</p>
                                <p className="text-sm text-gray-500">Switch to a darker theme for low-light environments</p>
                            </div>
                            <button
                                onClick={() => handleToggle('darkMode')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-gray-400" /> Session Defaults
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Default Duration</p>
                                    <p className="text-sm text-gray-500">Set the default timer for new attendance sessions</p>
                                </div>
                                <select
                                    name="defaultDuration"
                                    value={settings.defaultDuration}
                                    onChange={handleChange}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="1">1 Minute</option>
                                    <option value="5">5 Minutes</option>
                                    <option value="10">10 Minutes</option>
                                    <option value="15">15 Minutes</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Auto-Export CSV</p>
                                    <p className="text-sm text-gray-500">Automatically download CSV when session ends</p>
                                </div>
                                <button
                                    onClick={() => handleToggle('autoExport')}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoExport ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.autoExport ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Bell size={18} className="text-gray-400" /> Notifications
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Push Notifications</p>
                                <p className="text-sm text-gray-500">Receive alerts for low attendance or system updates</p>
                            </div>
                            <button
                                onClick={() => handleToggle('notifications')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.notifications ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;

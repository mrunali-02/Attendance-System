import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { BarChart, Activity, Users, Download } from 'lucide-react';

const Reports = () => {
    const [stats, setStats] = useState({ totalSessions: 0, avgAttendance: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/reports/teacher/${user.id}/stats`);
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <DashboardLayout role="teacher">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-gray-500">Visualize attendance trends and performance</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{loading ? '-' : stats.totalSessions}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Activity size={20} />
                            </div>
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                            +2 This week
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Avg. Attendance Rate</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{loading ? '-' : `${stats.avgAttendance}%`}</h3>
                            </div>
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <Users size={20} />
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            Across all classes
                        </div>
                    </div>
                </div>

                {/* Placeholder Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">Attendance Trends (Monthly)</h3>
                        <button className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:underline">
                            <Download size={16} /> Export PDF
                        </button>
                    </div>

                    <div className="h-64 flex items-end justify-between px-4 gap-2">
                        {[65, 78, 55, 82, 90, 75, 88].map((value, i) => (
                            <div key={i} className="w-full bg-gray-50 rounded-t-lg relative group">
                                <div
                                    className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600"
                                    style={{ height: `${value}%` }}
                                >
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {value}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-gray-500">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );

};

export default Reports;

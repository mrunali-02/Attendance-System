import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Search, Filter, Calendar as CalendarIcon, Download } from 'lucide-react';

const AttendanceLogs = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSessions = async () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user?.id) return;

            try {
                // Fetch all sessions (no limit)
                const response = await fetch(`/api/session/teacher/${user.id}/sessions`);
                const data = await response.json();
                if (response.ok) {
                    setSessions(data.sessions || []);
                }
            } catch (error) {
                console.error('Failed to fetch logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const filteredSessions = sessions.filter(session => {
        const metadata = typeof session.metadata === 'string'
            ? JSON.parse(session.metadata)
            : session.metadata || {};

        const searchString = `${metadata.year} ${metadata.branch} ${metadata.division}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
    });

    const handleDownload = async (sessionId) => {
        try {
            window.open(`/api/session/${sessionId}/export`, '_blank');
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <DashboardLayout role="teacher">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance Logs</h1>
                    <p className="text-gray-500">View and manage past attendance records</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by Class, Branch..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    {/* Placeholder for more filters */}
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                        <CalendarIcon size={18} />
                        <span>Date Range</span>
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Class Details</th>
                                <th className="px-6 py-4 text-center">Attendance %</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading logs...</td>
                                </tr>
                            ) : filteredSessions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No matching records found</td>
                                </tr>
                            ) : (filteredSessions.map((session) => {
                                const metadata = typeof session.metadata === 'string' ? JSON.parse(session.metadata) : session.metadata || {};
                                const total = (session.active || 0) + (session.absent || 0); // This logic might need strict checking depending on backend response struct
                                // Actually backend returns present_count, absent_count, total_marked
                                const present = session.present_count || 0;
                                const absent = session.absent_count || 0;
                                const totalMarked = session.total_marked || 0;
                                const rate = totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0;

                                return (
                                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {new Date(session.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(session.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {metadata.year || '-'} • {metadata.branch || '-'} • {metadata.division || '-'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Block: {metadata.block || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rate >= 75 ? 'bg-green-100 text-green-800' :
                                                    rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {rate}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'ACTIVE'
                                                    ? 'bg-blue-100 text-blue-700 animate-pulse'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDownload(session.id)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Download CSV"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AttendanceLogs;

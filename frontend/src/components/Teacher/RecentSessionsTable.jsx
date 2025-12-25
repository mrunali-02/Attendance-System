import React, { useState, useEffect } from 'react';
import { FileDown, MoreHorizontal, Calendar } from 'lucide-react';

const RecentSessionsTable = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            console.log('RecentSessionsTable: Fetching sessions for user:', user);

            if (!user?.id) {
                console.warn('RecentSessionsTable: No user ID found');
                setLoading(false);
                return;
            }

            try {
                const url = `/api/session/teacher/${user.id}/sessions`;
                console.log('RecentSessionsTable: Fetching from:', url);

                const response = await fetch(url);
                const data = await response.json();

                console.log('RecentSessionsTable: Response:', response.ok, data);

                if (response.ok) {
                    setSessions(data.sessions || []);
                    console.log('RecentSessionsTable: Loaded', data.sessions?.length || 0, 'sessions');
                } else {
                    console.error('RecentSessionsTable: API error:', data);
                }
            } catch (error) {
                console.error('RecentSessionsTable: Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Recent Sessions</h3>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-400">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-sm">Loading sessions...</p>
                </div>
            ) : sessions.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No sessions recorded yet</p>
                    <p className="text-xs mt-1">Start a new attendance session to see it here</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-950/50 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4">Class & Date</th>
                                <th className="px-6 py-4">Attendance Rate</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {sessions.map((session) => {
                                const attendanceRate = session.totalStudents > 0
                                    ? Math.round((session.present_count / session.totalStudents) * 100)
                                    : 0;
                                const sessionDate = new Date(session.created_at);
                                const formattedDate = sessionDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                                const formattedTime = sessionDate.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });

                                return (
                                    <tr key={session.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {session.year} {session.branch} - Div {session.division}
                                                </span>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    <Calendar size={12} />
                                                    {formattedDate} • {formattedTime}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${attendanceRate < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${attendanceRate}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {attendanceRate}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {session.present_count} Present • {session.absent_count} Absent
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${session.status === 'CLOSED'
                                                    ? attendanceRate < 60
                                                        ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                                                        : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                                    : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                                }
                  `}>
                                                {session.status === 'ACTIVE' ? 'Active' : attendanceRate < 60 ? 'Low Attendance' : 'Completed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {session.status === 'CLOSED' && (
                                                    <a
                                                        href={`/api/session/${session.id}/export`}
                                                        download
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                        title="Export CSV"
                                                    >
                                                        <FileDown size={18} />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RecentSessionsTable;

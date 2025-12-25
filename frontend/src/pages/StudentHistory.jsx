import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Loader2 } from 'lucide-react';

const StudentHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'student') {
            navigate('/login/student');
            return;
        }
        fetchHistory(user.id);
    }, []);

    const fetchHistory = async (studentId) => {
        setIsLoading(true);
        try {
            const historyRes = await fetch(`/api/attendance/student/${studentId}/history`);
            if (historyRes.ok) setHistory(await historyRes.json());
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;
    }

    return (
        <DashboardLayout role="student">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Attendance History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                                <tr>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Teacher</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Marked At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">No attendance records found.</td></tr>
                                ) : (
                                    history.map((record, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-medium text-slate-700">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {record.teacherName}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {record.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-500 text-sm">
                                                {record.markedAt ? new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentHistory;

import React, { useState, useEffect } from 'react';
import { StopCircle, UserCheck, UserX } from 'lucide-react';

const LivePanel = ({ onClose, sessionConfig }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [markedCount, setMarkedCount] = useState(0);
    const [sessionStatus, setSessionStatus] = useState('ACTIVE');
    const totalStudents = parseInt(sessionConfig?.totalStudents || 68);
    const [otpCode, setOtpCode] = useState(sessionConfig?.code || "....");

    useEffect(() => {
        if (sessionConfig?.code) {
            setOtpCode(sessionConfig.code);
        }

        // Calculate initial time from expiresAt if available
        if (sessionConfig?.expiresAt) {
            const now = new Date();
            const expiresAt = new Date(sessionConfig.expiresAt);
            const remainingMs = expiresAt - now;
            const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
            setTimeLeft(remainingSeconds);
        }
    }, [sessionConfig]);

    // Client-side countdown (decrements every second for smooth display)
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = Math.max(0, prev - 1);

                    // Auto-end session when timer reaches 0
                    if (newTime === 0 && sessionConfig?.sessionId) {
                        console.log('Timer reached 0, auto-ending session...');
                        fetch(`/api/session/${sessionConfig.sessionId}/end`, {
                            method: 'POST'
                        }).then(() => {
                            console.log('Session auto-ended successfully');
                        }).catch(err => {
                            console.error('Failed to auto-end session:', err);
                        });
                    }

                    return newTime;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, sessionConfig?.sessionId]);

    // Poll server for session state every 5 seconds (for sync and attendance count)
    useEffect(() => {
        if (!sessionConfig?.sessionId) {
            console.warn('LivePanel: No sessionId in config', sessionConfig);
            return;
        }

        const fetchSessionState = async () => {
            try {
                const response = await fetch(`/api/session/${sessionConfig.sessionId}/state`);
                const data = await response.json();

                console.log('Session state:', data);

                if (response.ok) {
                    setTimeLeft(data.remainingSeconds); // Sync with server
                    setMarkedCount(data.markedCount);
                    setSessionStatus(data.status);

                    // Auto-close if session ended
                    if (data.status === 'CLOSED') {
                        setTimeout(() => onClose(), 2000);
                    }
                } else {
                    console.error('Failed to fetch session state:', data);
                }
            } catch (error) {
                console.error('Failed to fetch session state:', error);
            }
        };

        // Initial fetch
        fetchSessionState();

        // Poll every 5 seconds
        const interval = setInterval(fetchSessionState, 5000);
        return () => clearInterval(interval);
    }, [sessionConfig?.sessionId, onClose]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const progress = (markedCount / totalStudents) * 100;

    return (
        <div className="bg-white border border-indigo-100 rounded-2xl shadow-lg p-6 animate-in fade-in slide-in-from-top-4">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-200"></span>
                        <span className="text-sm font-bold text-red-500 uppercase tracking-widest">
                            Live Session
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {sessionConfig?.year || 'TE'} {sessionConfig?.branch || 'CSE'} - Div {sessionConfig?.division || 'A'}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">{sessionConfig?.block || 'Classroom A-101'}</span>
                        <span>•</span>
                        <span>Total Students: {totalStudents}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-right px-2">
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Time Remaining</div>
                        <div className={`text-2xl font-mono font-bold ${timeLeft < 30 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* OTP Section (Prominent) */}
                <div className="md:col-span-1 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <p className="text-indigo-100 font-medium mb-4 uppercase tracking-wider text-xs">Share OTP with Students</p>
                    <div className="bg-white/10 rounded-xl px-6 py-4 backdrop-blur-sm border border-white/20 mb-2">
                        <div className="text-6xl font-mono font-bold tracking-[0.2em]">{otpCode}</div>
                    </div>
                    <p className="text-xs text-indigo-200 mt-2">Code expires in {formatTime(timeLeft)}</p>
                </div>

                {/* Stats Section */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-2xl p-5 flex items-center gap-4 border border-emerald-100">
                        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                            <UserCheck className="text-emerald-600" size={28} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-emerald-700">{markedCount}</div>
                            <div className="text-sm text-emerald-600 font-medium uppercase tracking-wide">Present</div>
                        </div>
                    </div>
                    <div className="bg-rose-50 rounded-2xl p-5 flex items-center gap-4 border border-rose-100">
                        <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                            <UserX className="text-rose-600" size={28} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-rose-700">{totalStudents - markedCount}</div>
                            <div className="text-sm text-rose-600 font-medium uppercase tracking-wide">Pending</div>
                        </div>
                    </div>

                    <div className="col-span-2 mt-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between text-sm font-bold mb-2 text-gray-700">
                            <span>Attendance Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm
                  ${progress < 60 ? 'bg-red-500' : progress < 75 ? 'bg-amber-500' : 'bg-emerald-500'}
                `}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                {sessionStatus === 'CLOSED' && (
                    <a
                        href={`/api/session/${sessionConfig?.sessionId}/export`}
                        download
                        className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Attendance Sheet
                    </a>
                )}
                <button
                    onClick={async () => {
                        if (!sessionConfig?.sessionId) return;
                        try {
                            await fetch(`/api/session/${sessionConfig.sessionId}/end`, {
                                method: 'POST'
                            });
                            onClose();
                        } catch (error) {
                            console.error('Failed to end session:', error);
                            onClose();
                        }
                    }}
                    className="flex items-center gap-2 bg-white border-2 border-red-100 text-red-600 px-8 py-3 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm active:scale-95"
                >
                    <StopCircle size={20} />
                    End Attendance Session
                </button>
            </div>
        </div>
    );
};

export default LivePanel;

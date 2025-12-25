import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import {
    MapPin,
    AlertCircle,
    Loader2,
    Calendar,
    CheckCircle2
} from 'lucide-react';
import OtpInput from '../components/Student/OtpInput';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeSession, setActiveSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // State for Marking Attendance
    const [step, setStep] = useState('idle'); // idle, locating, otp, result
    const [error, setError] = useState(null);
    const [location, setLocation] = useState(null);

    // Load initial data
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'student') {
            navigate('/login/student');
            return;
        }
        setUser(storedUser);
        fetchDashboardData(storedUser.id);
    }, []);

    const fetchDashboardData = async (studentId) => {
        setIsLoading(true);
        try {
            // Fetch Active Session
            const sessionRes = await fetch(`/api/attendance/student/${studentId}/active-session`);
            if (sessionRes.ok) setActiveSession(await sessionRes.json());
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const startVerification = () => {
        if (!activeSession?.session) return;
        setError(null);
        setStep('locating');

        if (!navigator.geolocation) {
            setError("Geolocation unavailable");
            setStep('error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setStep('otp');
            },
            (err) => {
                console.error(err);
                setError("Location access denied or failed.");
                setStep('error');
            }
        );
    };

    const handleOtpSubmit = async (otp) => {
        try {
            const response = await fetch('/api/attendance/mark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: user.id,
                    code: otp,
                    lat: location.lat,
                    lng: location.lng
                })
            });

            const result = await response.json();

            if (response.ok) {
                setStep('success');
                fetchDashboardData(user.id); // Refresh data
            } else {
                setError(result.error || 'Attendance failed');
                setStep('error');
            }
        } catch (err) {
            setError("Network error");
            setStep('error');
        }
    };

    const renderContent = () => {
        if (!activeSession?.session) {
            return (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100 text-center animate-in fade-in duration-500">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <Calendar className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700">No Active Session</h3>
                    <p className="text-slate-500 max-w-sm mt-2">
                        There are no classes currently taking attendance for your division.
                    </p>
                </div>
            );
        }

        if (activeSession.alreadyMarked) {
            return (
                <div className="flex flex-col items-center justify-center p-12 bg-emerald-50 rounded-2xl border border-emerald-100 text-center animate-in fade-in duration-500">
                    <div className="bg-emerald-100 p-4 rounded-full mb-4">
                        <CheckCircle2 className="text-emerald-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-800">Attendance Already Marked</h3>
                    <p className="text-emerald-600 mt-2">You have already submitted attendance for {activeSession.session.subject}.</p>
                </div>
            );
        }

        return (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                <div className="p-6 bg-slate-50 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">Mark Attendance</h3>
                    <p className="text-sm text-slate-500">Subject: {activeSession.session.subject}</p>
                </div>

                <div className="p-8">
                    {step === 'idle' && (
                        <div className="text-center">
                            <MapPin size={48} className="mx-auto text-indigo-500 mb-4" />
                            <p className="text-slate-600 mb-6">We need to verify your location provided by the teacher.</p>
                            <button
                                onClick={startVerification}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                            >
                                Start Verification
                            </button>
                        </div>
                    )}

                    {step === 'locating' && (
                        <div className="text-center py-8">
                            <Loader2 size={40} className="mx-auto text-indigo-500 animate-spin mb-4" />
                            <p className="font-medium text-slate-700">Verifying Location...</p>
                        </div>
                    )}

                    {step === 'otp' && (
                        <div className="text-center">
                            <h4 className="font-bold text-slate-800 mb-2">Enter OTP</h4>
                            <p className="text-sm text-slate-500 mb-6">Enter the code displayed by your teacher</p>
                            <OtpInput length={4} onComplete={handleOtpSubmit} />
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-emerald-700">Attendance Marked!</h3>
                            <button onClick={() => window.location.reload()} className="mt-6 text-slate-500 hover:text-slate-800 underline">
                                Done
                            </button>
                        </div>
                    )}

                    {step === 'error' && (
                        <div className="text-center">
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-start space-x-3 text-left">
                                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                            <button
                                onClick={() => setStep('idle')}
                                className="text-indigo-600 font-bold hover:underline"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;
    }

    return (
        <DashboardLayout role="student">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mark Attendance</h1>
                    <p className="text-slate-500">Active sessions for your class</p>
                </div>
                {renderContent()}
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;


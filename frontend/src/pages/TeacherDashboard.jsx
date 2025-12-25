import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Clock } from 'lucide-react';
import SummaryCard from '../components/Teacher/SummaryCard';
import ActionCard from '../components/Teacher/ActionCard';
import LivePanel from '../components/Teacher/LivePanel';
import StartAttendanceForm from '../components/Teacher/StartAttendanceForm';
import RecentSessionsTable from '../components/Teacher/RecentSessionsTable';
import DashboardLayout from '../components/Layout/DashboardLayout';

const TeacherDashboard = () => {
    const [viewState, setViewState] = useState('idle'); // idle, configuring, live
    const [sessionConfig, setSessionConfig] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); // For triggering sub-component updates
    const navigate = useNavigate();

    // Protect Route & Check Session
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user || user.role !== 'teacher') {
            navigate('/login/teacher');
            return;
        }

        const checkActiveSession = async () => {

            try {
                // Check if there's an active session for this teacher
                const response = await fetch(`/api/session/active/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.session && data.session.status === 'ACTIVE') {
                        // Recover session
                        const metadata = data.session.metadata ? JSON.parse(data.session.metadata) : {};
                        setSessionConfig({
                            ...metadata,
                            sessionId: data.session.id,
                            code: data.session.code,
                            expiresAt: data.session.expires_at
                        });
                        setViewState('live');
                    }
                }
            } catch (error) {
                console.error('Failed to check active session:', error);
            }
        };

        checkActiveSession();
    }, []);

    const handleStartConfig = () => {
        setViewState('configuring');
    };

    const handleLaunchSession = async (config) => {
        // Get location first
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const user = JSON.parse(localStorage.getItem('user'));

            try {
                const response = await fetch('/api/attendance/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        teacherId: user?.id,
                        lat: latitude,
                        lng: longitude,
                        radius: 50, // configured radius
                        durationMinutes: config.minuteDuration ? parseInt(config.minuteDuration) : 5, // Use config or default
                        metadata: JSON.stringify(config)
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error);

                console.log('Session created:', data);
                setSessionConfig({ ...config, ...data }); // Merge config with backend data (sessionId, code, expiresAt)
                setViewState('live');

            } catch (error) {
                alert("Failed to start session: " + error.message);
            }
        }, (error) => {
            alert("Unable to retrieve location: " + error.message);
        });
    };

    const handleEndSession = () => {
        setViewState('idle');
        setSessionConfig(null);
        setRefreshKey(prev => prev + 1); // Trigger refresh of recent sessions
    };

    return (
        <DashboardLayout role="teacher">
            <div className="space-y-8 animate-in fade-in duration-500">

                {/* Header Stats Removed */}
                <div className="hidden"></div>

                {/* Dynamic Main Section */}
                <div className="transition-all duration-300">
                    {viewState === 'idle' && (
                        <ActionCard onStart={handleStartConfig} />
                    )}

                    {viewState === 'configuring' && (
                        <StartAttendanceForm
                            onStart={handleLaunchSession}
                            onCancel={() => setViewState('idle')}
                        />
                    )}

                    {viewState === 'live' && (
                        <LivePanel
                            sessionConfig={sessionConfig}
                            onClose={handleEndSession}
                        />
                    )}
                </div>

                {/* Recent Sessions List */}
                <div className="pt-4">
                    <RecentSessionsTable key={refreshKey} />
                </div>

            </div>
        </DashboardLayout>
    );
};

export default TeacherDashboard;

import React from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, role = 'teacher' }) => {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
            <Sidebar role={role} />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <TopBar userRole={role === 'teacher' ? 'Teacher' : 'Student'} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

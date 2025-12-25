import React from 'react';
import { MapPin } from 'lucide-react';

const WelcomeCard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentName = user?.name || 'Student';

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Hello, {studentName} 👋</h2>
                <p className="text-gray-500 mt-1">Ready to learn? Don't forget to mark your attendance.</p>
            </div>
        </div>
    );
};

export default WelcomeCard;

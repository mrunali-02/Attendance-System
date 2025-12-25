import React from 'react';

const AttendanceProgress = ({ percentage = 0 }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    let color = 'text-emerald-500';
    if (percentage < 60) color = 'text-red-500';
    else if (percentage < 75) color = 'text-amber-500';

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-gray-500 font-medium mb-4">Overall Attendance</h3>

            <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-gray-100"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`${color} transition-all duration-1000 ease-out`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${percentage >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                        {percentage >= 75 ? 'Good' : 'At Risk'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AttendanceProgress;

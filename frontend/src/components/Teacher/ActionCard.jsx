import React from 'react';
import { Play } from 'lucide-react';

const ActionCard = ({ onStart }) => {
    return (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 shadow-lg text-white flex flex-col sm:flex-row items-center justify-between relative overflow-hidden group">
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>

            <div className="relative z-10 mb-4 sm:mb-0">
                <h2 className="text-2xl font-bold mb-2">Ready for Class?</h2>
                <p className="text-indigo-100 max-w-md">
                    Start a new attendance session instantly. The OTP will be generated automatically.
                </p>
            </div>

            <button
                onClick={onStart}
                className="relative z-10 flex items-center gap-3 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all shadow-md"
            >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Play size={16} className="fill-indigo-600" />
                </div>
                Start Attendance
            </button>
        </div>
    );
};

export default ActionCard;

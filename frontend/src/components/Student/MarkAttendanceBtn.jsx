import React, { useState } from 'react';
import { Fingerprint, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const MarkAttendanceBtn = ({ isInsideLocation, onMark }) => {
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleClick = () => {
        if (!isInsideLocation) return;

        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
            onMark?.();
        }, 1500);
    };

    if (status === 'success') {
        return (
            <div className="bg-emerald-500 text-white p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                <CheckCircle2 size={48} className="mb-4" />
                <h3 className="text-2xl font-bold">Attendance Marked!</h3>
                <p className="text-emerald-100 mt-2">You are present for Data Structures.</p>
            </div>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={!isInsideLocation || status === 'loading'}
            className={`
        relative w-full p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center transition-all duration-300 group
        ${!isInsideLocation
                    ? 'bg-gray-100 cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                }
      `}
        >
            {/* Ripple/Glow effect if active */}
            {isInsideLocation && status !== 'loading' && (
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}

            {status === 'loading' ? (
                <Loader2 size={48} className="animate-spin mb-4 text-white" />
            ) : !isInsideLocation ? (
                <XCircle size={48} className="mb-4 text-gray-400" />
            ) : (
                <Fingerprint size={48} className="mb-4" />
            )}

            <h3 className={`text-2xl font-bold ${!isInsideLocation ? 'text-gray-500' : 'text-white'}`}>
                {status === 'loading' ? 'Verifying Location...' : 'Mark Attendance'}
            </h3>

            <p className={`mt-2 ${!isInsideLocation ? 'text-gray-400' : 'text-indigo-100'}`}>
                {!isInsideLocation ? 'Go to class to enable' : 'Tap to mark yourself present'}
            </p>
        </button>
    );
};

export default MarkAttendanceBtn;

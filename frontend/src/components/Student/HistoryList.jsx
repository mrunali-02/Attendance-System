import React from 'react';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';

const HistoryList = () => {
    const history = [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-lg">Recent History</h3>
            </div>

            <div className="p-8 text-center">
                {history.length === 0 ? (
                    <div className="text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No attendance records yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {history.map((record) => (
                            <div key={record.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}
              `}>
                                        {record.status === 'Present' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{record.subject}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {record.date}
                                        </div>
                                    </div>
                                </div>

                                <div className={`
              text-sm font-medium px-3 py-1 rounded-full
              ${record.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}
            `}>
                                    {record.status}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryList;

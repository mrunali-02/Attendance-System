import React from 'react';

const SummaryCard = ({ title, value, subtext, icon: Icon, colorClass = "text-primary", bgClass = "bg-indigo-50" }) => {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${bgClass}`}>
                <Icon size={24} className={colorClass} />
            </div>
        </div>
    );
};

export default SummaryCard;

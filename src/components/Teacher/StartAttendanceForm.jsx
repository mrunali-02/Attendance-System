import React, { useState } from 'react';
import { Users, Building, ChevronDown, Clock } from 'lucide-react';

const StartAttendanceForm = ({ onStart, onCancel }) => {
    // Load defaults
    const savedSettings = JSON.parse(localStorage.getItem('teacherSettings') || '{}');

    const [formData, setFormData] = useState({
        totalStudents: 68,
        division: 'A',
        year: 'TE',
        branch: 'Computer Engineering',
        block: 'IT-304',
        minuteDuration: savedSettings.defaultDuration || '5' // Use setting or default 5
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.totalStudents <= 0) {
            alert("Total students must be a positive number");
            return;
        }

        onStart(formData);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 animate-in zoom-in-95 duration-300 max-w-2xl mx-auto">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Start New Session</h2>
                <p className="text-gray-500 mt-1">Configure details to generate attendance OTP</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Row 1: Branch & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Year</label>
                        <div className="relative">
                            <select
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 pr-10"
                            >
                                <option value="FE">First Year (FE)</option>
                                <option value="SE">Second Year (SE)</option>
                                <option value="TE">Third Year (TE)</option>
                                <option value="BE">Final Year (BE)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Branch</label>
                        <div className="relative">
                            <select
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 pr-10"
                            >
                                <option value="Civil Engineering">Civil Engineering</option>
                                <option value="Civil & Infrastructure Engineering">Civil & Infrastructure Engineering</option>
                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                <option value="Information Technology">Information Technology</option>
                                <option value="Computer Engineering">Computer Engineering</option>
                                <option value="Artificial Intelligence and Data Science Engineering">Artificial Intelligence and Data Science Engineering</option>
                                <option value="Electronics and Telecommunication Engineering">Electronics and Telecommunication Engineering</option>
                                <option value="Chemical Engineering">Chemical Engineering</option>
                                <option value="Humanities and Sciences">Humanities and Sciences</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>

                {/* Row 2: Division & Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Division</label>
                        <div className="relative">
                            <select
                                name="division"
                                value={formData.division}
                                onChange={handleChange}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 pr-10"
                            >
                                <option value="A">Div A</option>
                                <option value="B">Div B</option>
                                <option value="C">Div C</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Block / Classroom</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="block"
                                value={formData.block}
                                onChange={handleChange}
                                placeholder="e.g. IT-304"
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 pl-10"
                                required
                            />
                            <Building className="absolute left-3 top-3 text-gray-400" size={18} />
                        </div>
                    </div>
                </div>

                {/* Row 3: Count */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Total Students Expected</label>
                    <div className="relative">
                        <input
                            type="number"
                            name="totalStudents"
                            value={formData.totalStudents}
                            onChange={handleChange}
                            min="1"
                            max="200"
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 pl-10"
                            required
                        />
                        <Users className="absolute left-3 top-3 text-gray-400" size={18} />
                    </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Session Duration</label>
                    <div className="relative">
                        <select
                            name="minuteDuration"
                            value={formData.minuteDuration}
                            onChange={handleChange}
                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 pr-10"
                        >
                            <option value="1">1 Minute</option>
                            <option value="5">5 Minutes</option>
                            <option value="10">10 Minutes</option>
                            <option value="15">15 Minutes</option>
                            <option value="30">30 Minutes</option>
                        </select>
                        <Clock className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 px-5 text-sm font-medium text-gray-700 focus:outline-none bg-white rounded-xl border border-gray-200 hover:bg-gray-100 hover:text-indigo-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-xl text-sm px-5 py-3 text-center shadow-lg transition-transform active:scale-95"
                    >
                        Start Attendance
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StartAttendanceForm;

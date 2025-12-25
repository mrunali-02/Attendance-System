import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Lock, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage = () => {
    const { role } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Capitalize role for display
    const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';

    // Role-specific styling config
    const roleConfig = {
        teacher: {
            color: 'indigo',
            icon: <User className="w-5 h-5" />,
            title: 'Teacher Portal'
        },
        student: {
            color: 'emerald',
            icon: <User className="w-5 h-5" />,
            title: 'Student Portal'
        },
        admin: {
            color: 'blue',
            icon: <Lock className="w-5 h-5" />,
            title: 'Admin Console'
        }
    };

    const currentConfig = roleConfig[role] || roleConfig.teacher;
    const themeColor = currentConfig.color;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.username,
                    password: formData.password,
                    role: role
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Successful login
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); // Store user info

            if (data.user.role === 'teacher') navigate('/teacher/dashboard');
            else if (data.user.role === 'student') navigate('/student/dashboard');
            else if (data.user.role === 'admin') navigate('/admin/dashboard');
            else navigate('/');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
                {/* Header Section */}
                <div className={`bg-${themeColor}-600 p-8 text-center relative`}>
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
                        title="Back to Landing Page"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-3xl font-bold text-white mb-2">{currentConfig.title}</h2>
                    <p className="text-white/80">Login to your account</p>
                </div>

                {/* Form Section */}
                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 font-semibold">
                                {role === 'student' ? 'Roll Number / Email' : 'Email Address'}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    // Using inline style for dynamic focus color variable mapping if needed, 
                                    // but we will stick to standard classes for clarity.
                                    style={{
                                        '--tw-ring-color': `var(--${themeColor}-500)`,
                                        borderColor: `var(--${themeColor}-200)`
                                    }}
                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent transition-all font-medium`}
                                    placeholder={role === 'student' ? 'e.g. 2023CS01' : 'name@college.edu'}
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                                <div className="absolute left-3 top-3.5 text-slate-400">
                                    <User className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-slate-700 font-semibold">Password</label>
                                <a href="#" className={`text-xs font-medium text-${themeColor}-600 hover:text-${themeColor}-700`}>
                                    Forgot Password?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent transition-all`}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <div className="absolute left-3 top-3.5 text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 rounded-lg text-white font-bold shadow-lg shadow-${themeColor}-500/30 hover:shadow-${themeColor}-500/40 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 bg-${themeColor}-600 hover:bg-${themeColor}-700`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500">
                            Not {displayRole}?{' '}
                            <Link to="/" className={`font-semibold text-${themeColor}-600 hover:text-${themeColor}-700`}>
                                Switch Role
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { loginAdmin } from '../api/adminApi';
import toast from 'react-hot-toast';

const AdminLoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const data = await loginAdmin(email, password);
      if (!['admin', 'super_admin', 'moderator'].includes(data.role)) {
        toast.error('Access denied. Administrator credentials required.');
        setLoading(false);
        return;
      }
      toast.success(`Welcome back, ${data.name}!`);
      onLoginSuccess(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Neon Grid / Glow */}
      <div className="absolute w-96 h-96 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00F0FF]/20 to-[#00F0FF]/5 border border-[#00F0FF]/30 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(0,240,255,0.2)]">
            <ShieldCheck className="w-7 h-7 text-[#00F0FF]" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight pt-2">
            Operations & Control Center
          </h1>
          <p className="text-xs text-gray-400">
            Sign in to access DevHub platform management & moderation console.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Administrator Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@devhub.com"
                required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Master Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00F0FF] hover:bg-[#00d8e6] text-black font-extrabold text-xs py-3 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Enter Control Room'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[11px] text-gray-500">
            Protected by Zero-Trust RBAC & Session Forensics
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

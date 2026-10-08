import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signIn } from '@/services/authService';
import { BrandLogo } from '@/components/common/BrandLogo';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const msg = (err as Error).message || 'Invalid email or password';
      if (msg.includes('Email not confirmed')) {
        setError(
          'Your email address has not been confirmed yet. Please check your inbox or adjust Supabase email confirmation settings.'
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F5F7FC] dark:bg-[#0B1020] text-[#18223F] dark:text-[#F1F5F9] font-sans selection:bg-[#4355ED] selection:text-white">
      {/* LEFT VISUAL PANEL (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111A38] text-white flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        {/* Top Brand */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/">
            <BrandLogo size="md" textClassName="text-white" />
          </Link>
          <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-[#EEF0FF] uppercase tracking-wider">
            Academic Command Center
          </div>
        </div>

        {/* Hero copy in Visual Column */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-semibold text-4xl xl:text-5xl leading-[1.15] text-white">
              Your academic life, organized.
            </h1>
            <p className="mt-3 text-base text-[#A5AECB] leading-relaxed">
              Less mental clutter. More meaningful progress.
            </p>
          </motion.div>

          {/* Figma Milestone Preview Card (#3:72930) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-6 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-xl shadow-tf-card space-y-4"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#A5AECB]">
              <span>YOUR NEXT MILESTONE</span>
              <span className="text-[#22B7D0]">High priority</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#4355ED]/30 text-white">
                  Physics
                </span>
                <span className="text-sm font-semibold text-white">
                  Physics Tutorial 4 Due tomorrow
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-[#188A68] bg-[#E9F6F0]/20 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-xs text-[#A5AECB] space-y-2">
              <div className="flex items-center gap-3">
                <span>○ ERP upload pending</span>
                <span>○ Professor check pending</span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-white/10 text-white">01 Complete</span>
                <span className="text-white/40">→</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-white">02 Upload</span>
                <span className="text-white/40">→</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-white">03 Get checked</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Attribution */}
        <div className="relative z-10 text-xs text-[#A5AECB]">
          TaskFlow 2.0
        </div>
      </div>

      {/* RIGHT AUTH FORM PANEL */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 xl:p-20 overflow-y-auto">
        {/* Mobile Brand */}
        <div className="lg:hidden flex items-center justify-between mb-8">
          <Link to="/">
            <BrandLogo size="md" />
          </Link>
          <span className="text-xs text-[#66718C] dark:text-[#94A3B8]">
            Semester 03
          </span>
        </div>

        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          <div>
            <span className="text-[11px] font-semibold text-[#4355ED] uppercase tracking-wider">
              TASKFLOW / YOUR ACADEMIC WORKSPACE
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#18223F] dark:text-white mt-1">
              Welcome back.
            </h2>
            <p className="text-xs sm:text-sm text-[#66718C] dark:text-[#94A3B8] mt-1">
              Sign in and pick up where you left off.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#FDEEF1] dark:bg-rose-950/40 border border-[#D34D61]/30 text-xs text-[#D34D61] flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#18223F] dark:text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#939CB1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#18223F] dark:text-white placeholder-[#939CB1] focus:outline-none focus:ring-2 focus:ring-[#4355ED] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#18223F] dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#4355ED] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#939CB1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[#E5E9F3] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#18223F] dark:text-white placeholder-[#939CB1] focus:outline-none focus:ring-2 focus:ring-[#4355ED] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-[#4355ED] hover:bg-[#3646D7] shadow-tf-subtle flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-[#66718C] dark:text-[#94A3B8] pt-2">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#4355ED] font-semibold hover:underline">
              Create one
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-[#939CB1] pt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#188A68]" />
          <span>Your workspace. Your progress. Securely yours.</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { updateUserPassword } from '@/services/authService';
import { BrandLogo } from '@/components/common/BrandLogo';
import { Lock, Loader2, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await updateUserPassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: unknown) {
      console.error('Update password error:', err);
      setError((err as Error).message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between py-12 px-6 bg-[#F5F7FB] dark:bg-[#07090e] text-tf-deep dark:text-slate-100 font-sans selection:bg-tf-indigo selection:text-white">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-tf-muted dark:text-slate-400 hover:text-tf-indigo dark:hover:text-white transition-colors"
        >
          ← Back to Login
        </Link>
        <BrandLogo size="sm" />
      </div>

      {/* Main Center Container */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-tf-border dark:border-slate-800 shadow-tf-modal">
          {success ? (
            <div className="text-center space-y-4 py-3">
              <div className="w-14 h-14 rounded-2xl bg-tf-success/10 text-tf-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display font-extrabold text-2xl text-tf-deep dark:text-white">
                Password Updated!
              </h3>
              <p className="text-xs text-tf-muted dark:text-slate-400">
                Redirecting you to your academic dashboard...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-tf-deep dark:text-white">
                  Create New Password
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-tf-muted dark:text-slate-400">
                  Choose a secure new password for your TaskFlow account.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-3 shadow-tf-card"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-tf-deep dark:text-slate-200 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-tf-subtle">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-tf-border dark:border-slate-800 bg-white dark:bg-slate-900/80 text-tf-deep dark:text-white placeholder:text-tf-subtle focus:outline-none focus:ring-2 focus:ring-tf-indigo/30 focus:border-tf-indigo shadow-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-tf-deep dark:text-slate-200 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-tf-subtle">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-tf-border dark:border-slate-800 bg-white dark:bg-slate-900/80 text-tf-deep dark:text-white placeholder:text-tf-subtle focus:outline-none focus:ring-2 focus:ring-tf-indigo/30 focus:border-tf-indigo shadow-sm transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm text-white bg-brand-linear hover:opacity-95 active:scale-[0.99] shadow-md shadow-tf-indigo/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Update Password</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Security Note at bottom */}
      <div className="w-full max-w-md mx-auto pt-4 flex items-center justify-center gap-2 text-xs text-tf-subtle dark:text-slate-500">
        <ShieldCheck className="w-4 h-4 text-tf-success flex-shrink-0" />
        <span>Your academic workspace, securely yours.</span>
      </div>
    </div>
  );
};

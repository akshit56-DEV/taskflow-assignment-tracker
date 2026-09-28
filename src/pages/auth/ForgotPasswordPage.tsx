import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { resetPasswordForEmail } from '@/services/authService';
import { Sparkles, Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft, Send } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await resetPasswordForEmail(email.trim());
      setSuccess(true);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      setError((err as Error).message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/15 dark:bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4 relative z-10"
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/25 mb-4 border border-white/20"
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Reset Password
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          We'll send you a secure link to reset your TaskFlow password
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10"
      >
        <div className="glass-card py-8 px-6 sm:px-10 shadow-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl backdrop-blur-xl">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Email Sent
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                If an account exists for <strong className="text-brand-600">{email}</strong>, you
                will receive instructions shortly to reset your password.
              </p>
              <div className="pt-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-3 shadow-sm"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Account Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="student@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 active:from-brand-700 active:to-indigo-700 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

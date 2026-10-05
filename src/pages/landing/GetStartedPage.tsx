import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/common/BrandLogo';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Calendar,
  Layers,
  Clock,
  Flame,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const GetStartedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1020] text-[#18223F] dark:text-[#F1F5F9] font-sans selection:bg-[#4355ED] selection:text-white relative overflow-hidden">
      {/* Ambient background glow elements (Light & Airy) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-[#4355ED]/10 via-[#7970D9]/5 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-96 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#22B7D0]/10 via-[#4355ED]/5 to-transparent blur-3xl pointer-events-none -z-0" />

      {/* TOP NAVIGATION (Completely Public) */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between border-b border-[#E5E9F3]/80 dark:border-[#1E293B]/60 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2">
          <BrandLogo size="md" />
        </Link>

        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-[#66718C] dark:text-[#94A3B8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#188A68]" />
          <span>Academic Command Center for Higher Education</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-[#18223F] dark:text-slate-200 hover:text-[#4355ED] dark:hover:text-[#93B4FD] transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl font-semibold text-xs text-white bg-[#4355ED] hover:bg-[#3646D7] shadow-tf-subtle transition-all cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-12 pb-20 lg:pt-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Copy Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Approved Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#EEF0FF] dark:bg-[#4355ED]/20 text-[#4355ED] dark:text-[#93B4FD] border border-[#4355ED]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#4355ED] flex-shrink-0" />
              <span>BUILT FOR THE WAY STUDENTS ACTUALLY WORK</span>
            </div>

            {/* Approved Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold tracking-tight text-[#18223F] dark:text-white leading-[1.12]">
              Your academic life, organized.
            </h1>

            {/* Approved Supporting Text */}
            <p className="text-base sm:text-lg text-[#66718C] dark:text-[#94A3B8] leading-relaxed max-w-xl">
              Assignments, deadlines, tutorials, submissions and academic progress — all in one focused workspace.
            </p>

            {/* Call To Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-[#4355ED] hover:bg-[#3646D7] shadow-tf-subtle hover:shadow-tf-card transition-all cursor-pointer"
                >
                  <span>Get Started →</span>
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-[#18223F] dark:text-slate-200 hover:text-[#4355ED] dark:hover:text-[#93B4FD] transition-colors"
                >
                  Already have an account? Log in →
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#66718C] dark:text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-[#188A68] flex-shrink-0" />
                <span>One workspace. Every milestone accounted for.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Light Showcase of the 5-Stage Academic Loop */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-card p-6 sm:p-7 space-y-6"
            >
              {/* Showcase Top Bar */}
              <div className="flex items-center justify-between border-b border-[#E5E9F3] dark:border-[#1E293B] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#4355ED] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    ▰
                  </div>
                  <span className="font-semibold text-xs text-[#18223F] dark:text-white">
                    Academic Verification Engine
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E9F6F0] dark:bg-emerald-950/40 text-[#188A68] border border-[#188A68]/20 uppercase tracking-wide">
                  Active Sync
                </span>
              </div>

              {/* Showcase Headline */}
              <div>
                <span className="text-[11px] font-bold text-[#4355ED] uppercase tracking-wider">
                  The Core Principle
                </span>
                <h3 className="text-lg font-semibold text-[#18223F] dark:text-white mt-0.5">
                  Completed ≠ Submitted ≠ Checked
                </h3>
                <p className="text-xs text-[#66718C] dark:text-[#94A3B8] mt-1 leading-relaxed">
                  Finishing your work is only step one. TaskFlow tracks the complete submission journey to protect your grades and prevent missed deadlines.
                </p>
              </div>

              {/* 5-Stage Visual Workflow Pipeline */}
              <div className="p-4 rounded-xl bg-[#F5F7FC] dark:bg-[#0B1020] border border-[#E5E9F3] dark:border-[#1E293B] space-y-3">
                <div className="text-[11px] font-semibold text-[#66718C] dark:text-[#94A3B8] flex items-center justify-between">
                  <span>5-STAGE ACADEMIC PIPELINE</span>
                  <span className="text-[#4355ED] font-bold">100% Traceability</span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 text-center pt-1">
                  <div className="p-2 rounded-lg bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B]">
                    <div className="w-5 h-5 mx-auto rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center mb-1">
                      1
                    </div>
                    <div className="text-[10px] font-semibold text-[#18223F] dark:text-white leading-tight">
                      Not Started
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B]">
                    <div className="w-5 h-5 mx-auto rounded-full bg-[#EEF0FF] text-[#4355ED] text-[10px] font-bold flex items-center justify-center mb-1">
                      2
                    </div>
                    <div className="text-[10px] font-semibold text-[#18223F] dark:text-white leading-tight">
                      In Progress
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B]">
                    <div className="w-5 h-5 mx-auto rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold flex items-center justify-center mb-1">
                      3
                    </div>
                    <div className="text-[10px] font-semibold text-[#18223F] dark:text-white leading-tight">
                      Completed
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#EEECFF] dark:bg-[#4355ED]/20 border border-[#7970D9]/30">
                    <div className="w-5 h-5 mx-auto rounded-full bg-[#7970D9] text-white text-[10px] font-bold flex items-center justify-center mb-1">
                      4
                    </div>
                    <div className="text-[10px] font-bold text-[#4355ED] dark:text-[#93B4FD] leading-tight">
                      ERP Upload
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#E9F6F0] dark:bg-emerald-950/40 border border-[#188A68]/30">
                    <div className="w-5 h-5 mx-auto rounded-full bg-[#188A68] text-white text-[10px] font-bold flex items-center justify-center mb-1">
                      ✓
                    </div>
                    <div className="text-[10px] font-bold text-[#188A68] leading-tight">
                      Verified
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Micro-Pills */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-[#F5F7FC] dark:bg-[#0B1020] border border-[#E5E9F3] dark:border-[#1E293B] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#18223F] dark:text-white">
                    <Clock className="w-3.5 h-3.5 text-[#4355ED]" />
                    <span>Smart Urgency</span>
                  </div>
                  <p className="text-[11px] text-[#66718C] dark:text-[#94A3B8]">
                    Deadlines triaged automatically from 7 days down to hours.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F7FC] dark:bg-[#0B1020] border border-[#E5E9F3] dark:border-[#1E293B] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#18223F] dark:text-white">
                    <UploadCloud className="w-3.5 h-3.5 text-[#7970D9]" />
                    <span>ERP Gatekeeper</span>
                  </div>
                  <p className="text-[11px] text-[#66718C] dark:text-[#94A3B8]">
                    Reminders ensure files are uploaded before university cutoff.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3-STEP VALUE PROPOSITION SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-16 border-t border-[#E5E9F3] dark:border-[#1E293B]">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#18223F] dark:text-white">
            Done is only the first milestone.
          </h2>
          <p className="text-sm text-[#66718C] dark:text-[#94A3B8]">
            A clear path from starting your assignment to official recognition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 01 */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle space-y-3.5 hover:border-[#4355ED]/40 transition-all">
            <span className="text-2xl font-bold text-[#4355ED]">01</span>
            <h3 className="text-base font-semibold text-[#18223F] dark:text-white">
              Complete your work
            </h3>
            <p className="text-xs text-[#66718C] dark:text-[#94A3B8] leading-relaxed">
              Finish the assignment. Record notes and attachments. Never lose track of where your study session ended.
            </p>
          </div>

          {/* Step 02 */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle space-y-3.5 hover:border-[#7970D9]/40 transition-all">
            <span className="text-2xl font-bold text-[#7970D9]">02</span>
            <h3 className="text-base font-semibold text-[#18223F] dark:text-white">
              Upload to ERP
            </h3>
            <p className="text-xs text-[#66718C] dark:text-[#94A3B8] leading-relaxed">
              Submit your work online. Confirm the upload separately so you never miss a strict institutional portal cutoff.
            </p>
          </div>

          {/* Step 03 */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle space-y-3.5 hover:border-[#22B7D0]/40 transition-all">
            <span className="text-2xl font-bold text-[#22B7D0]">03</span>
            <h3 className="text-base font-semibold text-[#18223F] dark:text-white">
              Get professor checked
            </h3>
            <p className="text-xs text-[#66718C] dark:text-[#94A3B8] leading-relaxed">
              Track in-person lab evaluations and professor signatures. Close the academic loop with complete peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* CORE WORKSPACE CAPABILITIES GRID */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-16 border-t border-[#E5E9F3] dark:border-[#1E293B]">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
          <span className="text-xs font-bold text-[#4355ED] uppercase tracking-wider">
            All-In-One Academic OS
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#18223F] dark:text-white">
            Engineered specifically for academic workflows.
          </h2>
          <p className="text-sm text-[#66718C] dark:text-[#94A3B8]">
            Everything you need to handle intense course loads without missing a beat.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] dark:bg-[#4355ED]/20 text-[#4355ED] flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#18223F] dark:text-white">
              Smart Urgency Calculation
            </h3>
            <p className="text-xs text-[#66718C] dark:text-[#94A3B8] leading-relaxed">
              Deterministic prioritization categorizes upcoming work from Normal to Urgent and Critical automatically.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] dark:bg-[#4355ED]/20 text-[#4355ED] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#18223F] dark:text-white">
              Recurring Tutorials & Labs
            </h3>
            <p className="text-xs text-[#66718C] dark:text-[#94A3B8] leading-relaxed">
              Weekly and bi-weekly series generator builds your whole semester's lab schedule in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E9F3] dark:border-[#1E293B] shadow-tf-subtle space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] dark:bg-[#4355ED]/20 text-[#4355ED] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#18223F] dark:text-white">
              Subject Segregation
            </h3>
            <p className="text-xs text-[#66718C] dark:text-[#94A3B8] leading-relaxed">
              Keep coursework strictly isolated across subjects with custom colors, code badges, and completion stats.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION (Public) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-20 text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#18223F] dark:text-white tracking-tight">
            Make room for what’s next.
          </h2>
          <p className="text-sm text-[#66718C] dark:text-[#94A3B8]">
            Take command of your coursework with the workspace built for students.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-[#4355ED] hover:bg-[#3646D7] shadow-tf-subtle hover:shadow-tf-card transition-all cursor-pointer"
          >
            <span>Get Started →</span>
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl text-sm font-semibold text-[#18223F] dark:text-slate-200 hover:text-[#4355ED] dark:hover:text-[#93B4FD] transition-colors"
          >
            Already have an account? Log in →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-10 border-t border-[#E5E9F3] dark:border-[#1E293B] flex flex-col sm:flex-row items-center justify-between text-xs text-[#939CB1] gap-4">
        <div className="flex items-center gap-2.5">
          <BrandLogo size="sm" />
          <span>· Academic Workflow Manager</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#66718C] dark:text-[#94A3B8]">
          <Link to="/login" className="hover:text-[#4355ED] transition-colors">
            Log in
          </Link>
          <Link to="/signup" className="hover:text-[#4355ED] transition-colors">
            Create Account
          </Link>
        </div>
      </footer>
    </div>
  );
};

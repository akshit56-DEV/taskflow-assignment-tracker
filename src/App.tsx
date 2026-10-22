import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AssignmentProvider } from '@/context/AssignmentContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { BotpressChatbot } from '@/components/common/BotpressChatbot';

// ─── Auth pages: eagerly loaded (tiny, entry point for unauthenticated users) ─
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// ─── All other pages: lazy-loaded for code splitting ─────────────────────────
const GetStartedPage        = lazy(() => import('@/pages/landing/GetStartedPage').then(m => ({ default: m.GetStartedPage })));
const OnboardingPage        = lazy(() => import('@/pages/onboarding/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const FocusModePage         = lazy(() => import('@/pages/focus/FocusModePage').then(m => ({ default: m.FocusModePage })));
const DashboardPage         = lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AssignmentsPage       = lazy(() => import('@/pages/assignments/AssignmentsPage').then(m => ({ default: m.AssignmentsPage })));
const AssignmentDetailsPage = lazy(() => import('@/pages/assignments/AssignmentDetailsPage').then(m => ({ default: m.AssignmentDetailsPage })));
const CalendarPage          = lazy(() => import('@/pages/calendar/CalendarPage').then(m => ({ default: m.CalendarPage })));
const KanbanPage            = lazy(() => import('@/pages/kanban/KanbanPage').then(m => ({ default: m.KanbanPage })));
const RecurringPage         = lazy(() => import('@/pages/recurring/RecurringPage').then(m => ({ default: m.RecurringPage })));
const SubjectsPage          = lazy(() => import('@/pages/subjects/SubjectsPage').then(m => ({ default: m.SubjectsPage })));
const AnalyticsPage         = lazy(() => import('@/pages/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const NotificationsPage     = lazy(() => import('@/pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const ArchivePage           = lazy(() => import('@/pages/archive/ArchivePage').then(m => ({ default: m.ArchivePage })));
const TrashPage             = lazy(() => import('@/pages/trash/TrashPage').then(m => ({ default: m.TrashPage })));
const SettingsPage          = lazy(() => import('@/pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotFoundPage          = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// ─── Minimal page-transition fallback ────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0A0D1E]">
    <div className="w-8 h-8 border-2 border-[#5B4DF5] border-t-transparent rounded-full animate-spin" />
  </div>
);

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AssignmentProvider>
            <BrowserRouter>
              {/* Botpress AI Chatbot - Global Floating Bubble */}
              <BotpressChatbot />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Auth Routes — eagerly loaded */}
                  <Route path="/login"           element={<LoginPage />} />
                  <Route path="/signup"          element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password"  element={<ResetPasswordPage />} />

                  {/* Protected Onboarding & Focus Mode Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/focus"      element={<FocusModePage />} />
                  </Route>

                  {/* Protected Main App Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/dashboard"        element={<DashboardPage />} />
                      <Route path="/assignments"      element={<AssignmentsPage />} />
                      <Route path="/assignments/:id"  element={<AssignmentDetailsPage />} />
                      <Route path="/calendar"         element={<CalendarPage />} />
                      <Route path="/kanban"           element={<KanbanPage />} />
                      <Route path="/recurring"        element={<RecurringPage />} />
                      <Route path="/subjects"         element={<SubjectsPage />} />
                      <Route path="/analytics"        element={<AnalyticsPage />} />
                      <Route path="/notifications"    element={<NotificationsPage />} />
                      <Route path="/archive"          element={<ArchivePage />} />
                      <Route path="/trash"            element={<TrashPage />} />
                      <Route path="/settings"         element={<SettingsPage />} />
                    </Route>
                  </Route>

                  {/* Root Route: Get Started Landing */}
                  <Route path="/" element={<GetStartedPage />} />

                  {/* 404 Catch-All */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AssignmentProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;


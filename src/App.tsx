import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AssignmentProvider } from '@/context/AssignmentContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { GetStartedPage } from '@/pages/landing/GetStartedPage';

// Main Application Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { AssignmentsPage } from '@/pages/assignments/AssignmentsPage';
import { AssignmentDetailsPage } from '@/pages/assignments/AssignmentDetailsPage';
import { CalendarPage } from '@/pages/calendar/CalendarPage';
import { KanbanPage } from '@/pages/kanban/KanbanPage';
import { RecurringPage } from '@/pages/recurring/RecurringPage';
import { SubjectsPage } from '@/pages/subjects/SubjectsPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { ArchivePage } from '@/pages/archive/ArchivePage';
import { TrashPage } from '@/pages/trash/TrashPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { FocusModePage } from '@/pages/focus/FocusModePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AssignmentProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected Onboarding & Focus Mode Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/focus" element={<FocusModePage />} />
                </Route>

                {/* Protected Main App Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/assignments" element={<AssignmentsPage />} />
                    <Route path="/assignments/:id" element={<AssignmentDetailsPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/kanban" element={<KanbanPage />} />
                    <Route path="/recurring" element={<RecurringPage />} />
                    <Route path="/subjects" element={<SubjectsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/archive" element={<ArchivePage />} />
                    <Route path="/trash" element={<TrashPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                {/* Root Route: Figma Get Started Landing */}
                <Route path="/" element={<GetStartedPage />} />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </AssignmentProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

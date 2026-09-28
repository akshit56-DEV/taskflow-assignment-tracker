-- ====================================================================
-- TaskFlow Database Schema Migration
-- Migration: 20260928000001_initial_schema.sql
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. PROFILES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    reminder_settings JSONB DEFAULT '{"days_before": [3, 1, 0], "email_reminders": false, "in_app_reminders": true, "browser_reminders": true}'::jsonb,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 2. SUBJECTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    color TEXT DEFAULT '#3b82f6' NOT NULL,
    icon TEXT DEFAULT 'BookOpen',
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 3. RECURRING ASSIGNMENTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.recurring_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_generated_date DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 4. ASSIGNMENTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    assigned_date DATE,
    due_date DATE NOT NULL,
    progress_status TEXT NOT NULL DEFAULT 'not_started' CHECK (progress_status IN ('not_started', 'in_progress')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    
    -- Independent workflow fields
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    
    uploaded_to_erp BOOLEAN NOT NULL DEFAULT FALSE,
    erp_upload_date TIMESTAMPTZ,
    
    professor_checked BOOLEAN NOT NULL DEFAULT FALSE,
    checked_at TIMESTAMPTZ,
    
    notes TEXT,
    recurring_assignment_id UUID REFERENCES public.recurring_assignments(id) ON DELETE SET NULL,
    recurring_instance_date DATE,
    
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 5. ASSIGNMENT ATTACHMENTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.assignment_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 6. ASSIGNMENT LINKS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.assignment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 7. NOTIFICATIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('due_soon', 'overdue', 'erp_pending', 'system')),
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- 8. ACTIVITY LOG TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_subject_id ON public.assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_completed ON public.assignments(completed);
CREATE INDEX IF NOT EXISTS idx_assignments_uploaded_to_erp ON public.assignments(uploaded_to_erp);
CREATE INDEX IF NOT EXISTS idx_assignments_professor_checked ON public.assignments(professor_checked);
CREATE INDEX IF NOT EXISTS idx_assignments_progress_status ON public.assignments(progress_status);
CREATE INDEX IF NOT EXISTS idx_assignments_is_deleted ON public.assignments(is_deleted);
CREATE INDEX IF NOT EXISTS idx_assignments_is_archived ON public.assignments(is_archived);
CREATE INDEX IF NOT EXISTS idx_assignments_recurring_inst ON public.assignments(recurring_assignment_id, recurring_instance_date);

CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_assignment_id ON public.assignment_attachments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_links_assignment_id ON public.assignment_links(assignment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id, created_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- 1. Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subjects"
    ON public.subjects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subjects"
    ON public.subjects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subjects"
    ON public.subjects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subjects"
    ON public.subjects FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Recurring Assignments
ALTER TABLE public.recurring_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recurring assignments"
    ON public.recurring_assignments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recurring assignments"
    ON public.recurring_assignments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring assignments"
    ON public.recurring_assignments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring assignments"
    ON public.recurring_assignments FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assignments"
    ON public.assignments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assignments"
    ON public.assignments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assignments"
    ON public.assignments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assignments"
    ON public.assignments FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Attachments
ALTER TABLE public.assignment_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attachments"
    ON public.assignment_attachments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own attachments"
    ON public.assignment_attachments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attachments"
    ON public.assignment_attachments FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Links
ALTER TABLE public.assignment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own links"
    ON public.assignment_links FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own links"
    ON public.assignment_links FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links"
    ON public.assignment_links FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links"
    ON public.assignment_links FOR DELETE
    USING (auth.uid() = user_id);

-- 7. Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- 8. Activity Log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
    ON public.activity_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
    ON public.activity_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity"
    ON public.activity_log FOR DELETE
    USING (auth.uid() = user_id);

-- ====================================================================
-- AUTOMATIC USER SETUP TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Create user profile
    INSERT INTO public.profiles (id, full_name, email, onboarding_completed)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        FALSE
    );

    -- 2. Create initial default subjects
    INSERT INTO public.subjects (user_id, name, code, color, icon)
    VALUES 
        (NEW.id, 'CPLT', 'CS101', '#3b82f6', 'Code'),
        (NEW.id, 'FOA', 'CS102', '#8b5cf6', 'Layers'),
        (NEW.id, 'Physics', 'PHY101', '#ec4899', 'Atom'),
        (NEW.id, 'Communication Skills', 'HUM101', '#10b981', 'MessageSquare'),
        (NEW.id, 'Maths', 'MTH101', '#f59e0b', 'Calculator'),
        (NEW.id, 'DDAL', 'CS103', '#6366f1', 'Cpu');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_recurring_assignments_updated_at BEFORE UPDATE ON public.recurring_assignments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- TaskFlow Database Fix: Grants, RLS Policies, Profile & Subject Backfill
-- Migration: 20260928000003_fix_grants_rls_profiles_subjects.sql
-- ====================================================================

-- ====================================================================
-- 1. POSTGRESQL SCHEMA & TABLE GRANTS (Fix "permission denied" errors)
-- ====================================================================

-- Ensure standard schema usage
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant full table permissions to authenticated role for all public tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- Ensure service_role and postgres retain full privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Set default privileges for any future tables created in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

-- ====================================================================
-- 2. UNIQUE CONSTRAINT FOR DUPLICATE SUBJECT PREVENTION
-- ====================================================================
-- Ensure subjects table has unique (user_id, name) so default subjects can be safely upserted/backfilled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'subjects_user_id_name_key'
    ) THEN
        ALTER TABLE public.subjects ADD CONSTRAINT subjects_user_id_name_key UNIQUE (user_id, name);
    END IF;
END $$;

-- ====================================================================
-- 3. RE-APPLY & STANDARDIZE ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all user tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- A. Profiles Policies
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = id);

-- --------------------------------------------------------------------
-- B. Subjects Policies
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can create own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can update own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can delete own subjects" ON public.subjects;

CREATE POLICY "Users can view own subjects"
    ON public.subjects FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own subjects"
    ON public.subjects FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own subjects"
    ON public.subjects FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own subjects"
    ON public.subjects FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------
-- C. Assignments Policies
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can create own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can update own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can delete own assignments" ON public.assignments;

CREATE POLICY "Users can view own assignments"
    ON public.assignments FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own assignments"
    ON public.assignments FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own assignments"
    ON public.assignments FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own assignments"
    ON public.assignments FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------
-- D. Recurring Assignments Policies
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own recurring assignments" ON public.recurring_assignments;
DROP POLICY IF EXISTS "Users can create own recurring assignments" ON public.recurring_assignments;
DROP POLICY IF EXISTS "Users can update own recurring assignments" ON public.recurring_assignments;
DROP POLICY IF EXISTS "Users can delete own recurring assignments" ON public.recurring_assignments;

CREATE POLICY "Users can view own recurring assignments"
    ON public.recurring_assignments FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own recurring assignments"
    ON public.recurring_assignments FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own recurring assignments"
    ON public.recurring_assignments FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own recurring assignments"
    ON public.recurring_assignments FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------
-- E. Assignment Attachments Policies
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Users can upload own attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Users can update own attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Users can delete own attachments" ON public.assignment_attachments;

CREATE POLICY "Users can view own attachments"
    ON public.assignment_attachments FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can upload own attachments"
    ON public.assignment_attachments FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own attachments"
    ON public.assignment_attachments FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own attachments"
    ON public.assignment_attachments FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------
-- F. Assignment Links Policies
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own links" ON public.assignment_links;
DROP POLICY IF EXISTS "Users can create own links" ON public.assignment_links;
DROP POLICY IF EXISTS "Users can update own links" ON public.assignment_links;
DROP POLICY IF EXISTS "Users can delete own links" ON public.assignment_links;

CREATE POLICY "Users can view own links"
    ON public.assignment_links FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own links"
    ON public.assignment_links FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own links"
    ON public.assignment_links FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own links"
    ON public.assignment_links FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------
-- G. Notifications Policies
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own notifications"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- --------------------------------------------------------------------
-- H. Activity Log Policies
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_log;
DROP POLICY IF EXISTS "Users can insert own activity" ON public.activity_log;
DROP POLICY IF EXISTS "Users can update own activity" ON public.activity_log;
DROP POLICY IF EXISTS "Users can delete own activity" ON public.activity_log;

CREATE POLICY "Users can view own activity"
    ON public.activity_log FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own activity"
    ON public.activity_log FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own activity"
    ON public.activity_log FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own activity"
    ON public.activity_log FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ====================================================================
-- 4. ROBUST USER CREATION TRIGGER & FUNCTION (SECURITY DEFINER)
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    derived_name TEXT;
BEGIN
    -- Extract full name from raw_user_meta_data or fallback to email local-part
    derived_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
        split_part(NEW.email, '@', 1),
        'Student'
    );

    -- 1. Create or update user profile
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        onboarding_completed,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        derived_name,
        NEW.email,
        FALSE,
        TIMEZONE('utc'::text, NOW()),
        TIMEZONE('utc'::text, NOW())
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
        updated_at = TIMEZONE('utc'::text, NOW());

    -- 2. Create initial default subjects (6 mandatory core subjects)
    INSERT INTO public.subjects (user_id, name, code, color, icon)
    VALUES 
        (NEW.id, 'CPLT', 'CS101', '#3b82f6', 'Code'),
        (NEW.id, 'FOA', 'CS102', '#8b5cf6', 'Layers'),
        (NEW.id, 'Physics', 'PHY101', '#ec4899', 'Atom'),
        (NEW.id, 'Communication Skills', 'HUM101', '#10b981', 'MessageSquare'),
        (NEW.id, 'Maths', 'MTH101', '#f59e0b', 'Calculator'),
        (NEW.id, 'DDAL', 'CS103', '#6366f1', 'Cpu')
    ON CONFLICT (user_id, name) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 5. IDEMPOTENT BACKFILL FOR EXISTING USERS
-- ====================================================================

-- A. Backfill missing profiles for all existing auth.users
INSERT INTO public.profiles (
    id,
    full_name,
    email,
    onboarding_completed,
    created_at,
    updated_at
)
SELECT 
    u.id,
    COALESCE(
        NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
        split_part(u.email, '@', 1),
        'Student'
    ) AS full_name,
    u.email,
    FALSE AS onboarding_completed,
    COALESCE(u.created_at, TIMEZONE('utc'::text, NOW())),
    TIMEZONE('utc'::text, NOW())
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- B. Backfill missing default subjects for all existing auth.users
INSERT INTO public.subjects (user_id, name, code, color, icon)
SELECT 
    u.id,
    defaults.name,
    defaults.code,
    defaults.color,
    defaults.icon
FROM auth.users u
CROSS JOIN (
    VALUES 
        ('CPLT', 'CS101', '#3b82f6', 'Code'),
        ('FOA', 'CS102', '#8b5cf6', 'Layers'),
        ('Physics', 'PHY101', '#ec4899', 'Atom'),
        ('Communication Skills', 'HUM101', '#10b981', 'MessageSquare'),
        ('Maths', 'MTH101', '#f59e0b', 'Calculator'),
        ('DDAL', 'CS103', '#6366f1', 'Cpu')
) AS defaults(name, code, color, icon)
ON CONFLICT (user_id, name) DO NOTHING;

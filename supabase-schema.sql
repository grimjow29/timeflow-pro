-- TimeFlow Pro - Database Schema
-- Execute this SQL in Supabase SQL Editor
-- Version idempotente - peut être exécutée plusieurs fois sans erreur

-- =====================
-- CLEANUP (supprime les objets existants)
-- =====================

-- Supprimer les triggers existants
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_groups_updated_at ON public.groups;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_time_entries_updated_at ON public.time_entries;
DROP TRIGGER IF EXISTS update_timesheet_approvals_updated_at ON public.timesheet_approvals;

-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

-- Supprimer les tables existantes (ordre inverse des dépendances)
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.time_entries CASCADE;
DROP TABLE IF EXISTS public.timesheet_approvals CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Supprimer les types existants
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS approval_status CASCADE;

-- =====================
-- ENUMS
-- =====================
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE', 'VALIDATOR');
CREATE TYPE project_status AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');
CREATE TYPE approval_status AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');

-- =====================
-- TABLES
-- =====================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'EMPLOYEE',
  group_id UUID,
  weekly_goal_hours INTEGER DEFAULT 40,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for group_id after groups table exists
ALTER TABLE public.profiles
ADD CONSTRAINT fk_profile_group
FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE SET NULL;

-- Projects (with hierarchy)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#8b5cf6',
  parent_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  billable BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(10,2),
  budget DECIMAL(10,2),
  status project_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags system
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8b5cf6',
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timesheet Approvals
CREATE TABLE public.timesheet_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  validator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_hours DECIMAL(10,2) DEFAULT 0,
  status approval_status DEFAULT 'DRAFT',
  comments TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Time Entries
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- in minutes
  description TEXT,
  billable BOOLEAN DEFAULT true,
  tags UUID[] DEFAULT '{}',
  timesheet_id UUID REFERENCES public.timesheet_approvals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX idx_time_entries_user_date ON public.time_entries(user_id, date);
CREATE INDEX idx_time_entries_project ON public.time_entries(project_id);
CREATE INDEX idx_timesheet_user_week ON public.timesheet_approvals(user_id, week_start);
CREATE INDEX idx_projects_parent ON public.projects(parent_id);
CREATE INDEX idx_profiles_group ON public.profiles(group_id);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheet_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Groups policies
CREATE POLICY "Groups are viewable by authenticated users" ON public.groups
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and managers can manage groups" ON public.groups
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER'))
  );

-- Projects policies
CREATE POLICY "Projects are viewable by authenticated users" ON public.projects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage all projects" ON public.projects
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Managers can create projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER'))
  );

-- Tags policies
CREATE POLICY "Users can manage their own tags" ON public.tags
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Time entries policies
CREATE POLICY "Users can view own time entries" ON public.time_entries
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Managers can view team time entries" ON public.time_entries
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.groups g ON g.manager_id = p.id
      JOIN public.profiles team_member ON team_member.group_id = g.id
      WHERE p.id = auth.uid() AND team_member.id = time_entries.user_id
    )
  );

CREATE POLICY "Users can create own time entries" ON public.time_entries
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own time entries" ON public.time_entries
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own time entries" ON public.time_entries
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Timesheet approvals policies
CREATE POLICY "Users can view own timesheets" ON public.timesheet_approvals
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Validators can view assigned timesheets" ON public.timesheet_approvals
  FOR SELECT TO authenticated USING (validator_id = auth.uid());

CREATE POLICY "Users can create own timesheets" ON public.timesheet_approvals
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own draft timesheets" ON public.timesheet_approvals
  FOR UPDATE TO authenticated USING (user_id = auth.uid() AND status = 'DRAFT');

CREATE POLICY "Validators can update assigned timesheets" ON public.timesheet_approvals
  FOR UPDATE TO authenticated USING (validator_id = auth.uid());

-- =====================
-- TRIGGER: Auto-create profile on signup
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- TRIGGER: Update updated_at timestamp
-- =====================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_timesheet_approvals_updated_at BEFORE UPDATE ON public.timesheet_approvals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================
-- SEED DATA (Optional)
-- =====================
-- Insert some default projects
INSERT INTO public.projects (name, description, color, status) VALUES
  ('Client ABC Corp', 'Refonte Site Web', '#8b5cf6', 'ACTIVE'),
  ('App Mobile', 'iOS & Android Development', '#ec4899', 'ACTIVE'),
  ('Interne', 'Projets internes', '#10b981', 'ACTIVE');

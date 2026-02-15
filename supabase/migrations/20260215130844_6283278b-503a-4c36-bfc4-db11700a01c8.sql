
-- Add user_id column to user_codes to link to Supabase Auth
ALTER TABLE public.user_codes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint on code
ALTER TABLE public.user_codes ADD CONSTRAINT user_codes_code_unique UNIQUE (code);

-- Drop all existing open policies on user_codes
DROP POLICY IF EXISTS "Anyone can read codes" ON public.user_codes;
DROP POLICY IF EXISTS "Anyone can create codes" ON public.user_codes;

-- Drop all existing open policies on habit_entries
DROP POLICY IF EXISTS "Anyone can read entries" ON public.habit_entries;
DROP POLICY IF EXISTS "Anyone can insert entries" ON public.habit_entries;
DROP POLICY IF EXISTS "Anyone can update entries" ON public.habit_entries;
DROP POLICY IF EXISTS "Anyone can delete entries" ON public.habit_entries;

-- Drop all existing open policies on user_habits
DROP POLICY IF EXISTS "Anyone can read habits" ON public.user_habits;
DROP POLICY IF EXISTS "Anyone can insert habits" ON public.user_habits;
DROP POLICY IF EXISTS "Anyone can update habits" ON public.user_habits;
DROP POLICY IF EXISTS "Anyone can delete habits" ON public.user_habits;

-- Create auth-scoped policies for user_codes
CREATE POLICY "Users can read own codes"
ON public.user_codes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own codes"
ON public.user_codes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create auth-scoped policies for habit_entries
CREATE POLICY "Users can read own entries"
ON public.habit_entries FOR SELECT TO authenticated
USING (
  user_code_id IN (SELECT id FROM public.user_codes WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert own entries"
ON public.habit_entries FOR INSERT TO authenticated
WITH CHECK (
  user_code_id IN (SELECT id FROM public.user_codes WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own entries"
ON public.habit_entries FOR UPDATE TO authenticated
USING (
  user_code_id IN (SELECT id FROM public.user_codes WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete own entries"
ON public.habit_entries FOR DELETE TO authenticated
USING (
  user_code_id IN (SELECT id FROM public.user_codes WHERE user_id = auth.uid())
);

-- Create auth-scoped policies for user_habits
CREATE POLICY "Users can read own habits"
ON public.user_habits FOR SELECT TO authenticated
USING (
  user_code_id IN (SELECT id FROM public.user_codes WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert own habits"
ON public.user_habits FOR INSERT TO authenticated
WITH CHECK (
  user_code_id IN (SELECT id FROM public.user_codes WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own habits"
ON public.user_habits FOR UPDATE TO authenticated
USING (
  user_code_id IN (SELECT id FROM public.user_codes WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete own habits"
ON public.user_habits FOR DELETE TO authenticated
USING (
  user_code_id IN (SELECT id FROM public.user_codes WHERE user_id = auth.uid())
);


-- Table for user codes (simple code-based auth)
CREATE TABLE public.user_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can check if a code exists (for login)
CREATE POLICY "Anyone can read codes" ON public.user_codes FOR SELECT USING (true);
-- Anyone can create a code (for signup)
CREATE POLICY "Anyone can create codes" ON public.user_codes FOR INSERT WITH CHECK (true);

-- Table for habit tracking entries
CREATE TABLE public.habit_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_code_id UUID NOT NULL REFERENCES public.user_codes(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  week_start DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_code_id, habit_name, day_of_week, week_start)
);

ALTER TABLE public.habit_entries ENABLE ROW LEVEL SECURITY;

-- Public access since we use code-based auth (no Supabase auth)
CREATE POLICY "Anyone can read entries" ON public.habit_entries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert entries" ON public.habit_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update entries" ON public.habit_entries FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete entries" ON public.habit_entries FOR DELETE USING (true);

-- Table for storing habit names per user
CREATE TABLE public.user_habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_code_id UUID NOT NULL REFERENCES public.user_codes(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_code_id, habit_name)
);

ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read habits" ON public.user_habits FOR SELECT USING (true);
CREATE POLICY "Anyone can insert habits" ON public.user_habits FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete habits" ON public.user_habits FOR DELETE USING (true);


-- Add sort_order column to user_habits for manual reordering
ALTER TABLE public.user_habits ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

-- Allow updating user_habits (needed for rename and reorder)
CREATE POLICY "Anyone can update habits"
ON public.user_habits
FOR UPDATE
USING (true);

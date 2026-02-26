CREATE TABLE public.results_cache (
  reg TEXT NOT NULL PRIMARY KEY,
  payload JSONB NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.results_cache ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - only accessed by edge function via service role
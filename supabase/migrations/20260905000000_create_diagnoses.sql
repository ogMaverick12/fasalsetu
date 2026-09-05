-- Create diagnoses table for FasalSetu crop disease diagnosis
CREATE TABLE IF NOT EXISTS public.diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    image_url TEXT,
    crop_type TEXT,
    diagnosis_text TEXT,
    state TEXT,
    language TEXT NOT NULL DEFAULT 'en'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to insert diagnoses
CREATE POLICY "Allow public insert to diagnoses"
    ON public.diagnoses
    FOR INSERT
    WITH CHECK (true);

-- Allow public read access to diagnoses
CREATE POLICY "Allow public select on diagnoses"
    ON public.diagnoses
    FOR SELECT
    USING (true);

-- Index for queries by state and created_at (useful for Phase 4 scale aggregates)
CREATE INDEX IF NOT EXISTS idx_diagnoses_state ON public.diagnoses(state);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON public.diagnoses(created_at DESC);

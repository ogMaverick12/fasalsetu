-- Create advisories table for FasalSetu localized weather and crop advisory
CREATE TABLE IF NOT EXISTS public.advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    crop_type TEXT,
    weather_snapshot JSONB,
    advisory_text TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to insert advisories
CREATE POLICY "Allow public insert to advisories"
    ON public.advisories
    FOR INSERT
    WITH CHECK (true);

-- Allow public read access to advisories
CREATE POLICY "Allow public select on advisories"
    ON public.advisories
    FOR SELECT
    USING (true);

-- Index for fast district-level queries and chronological retrieval
CREATE INDEX IF NOT EXISTS idx_advisories_state_district ON public.advisories(state, district);
CREATE INDEX IF NOT EXISTS idx_advisories_created_at ON public.advisories(created_at DESC);

-- ============================================
-- Certificate Analysis System — Schema Extension
-- ============================================

-- Add new columns to certificates table for enhanced AI metadata
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS participant_name TEXT,
  ADD COLUMN IF NOT EXISTS certificate_type TEXT,
  ADD COLUMN IF NOT EXISTS event_type TEXT,
  ADD COLUMN IF NOT EXISTS achievement TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS expiry_date TEXT,
  ADD COLUMN IF NOT EXISTS technologies TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS resume_summary TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_summary TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_summary TEXT,
  ADD COLUMN IF NOT EXISTS reflection TEXT,
  ADD COLUMN IF NOT EXISTS confidence REAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS difficulty TEXT,
  ADD COLUMN IF NOT EXISTS importance TEXT,
  ADD COLUMN IF NOT EXISTS credibility TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS competition_level TEXT,
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS subdomain TEXT,
  ADD COLUMN IF NOT EXISTS estimated_hours INTEGER,
  ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS file_hash TEXT,
  ADD COLUMN IF NOT EXISTS ocr_text TEXT,
  ADD COLUMN IF NOT EXISTS analysis_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS analysis_retries INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]';

-- Index for duplicate detection by file hash
CREATE INDEX IF NOT EXISTS idx_certificates_file_hash ON public.certificates(file_hash);

-- Index for analysis status filtering
CREATE INDEX IF NOT EXISTS idx_certificates_analysis_status ON public.certificates(analysis_status);

-- ============================================
-- Certificate Supporting Images
-- ============================================
CREATE TABLE IF NOT EXISTS public.certificate_supporting_images (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  certificate_id UUID NOT NULL REFERENCES public.certificates(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_public_id TEXT,
  image_type TEXT DEFAULT 'general',
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cert_supporting_images_cert
  ON public.certificate_supporting_images(certificate_id);

-- RLS for supporting images
ALTER TABLE public.certificate_supporting_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read supporting images"
  ON public.certificate_supporting_images FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.certificates
    WHERE certificates.id = certificate_supporting_images.certificate_id
      AND certificates.status = 'published'
  ));

CREATE POLICY "Auth read all supporting images"
  ON public.certificate_supporting_images FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth insert supporting images"
  ON public.certificate_supporting_images FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth update supporting images"
  ON public.certificate_supporting_images FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth delete supporting images"
  ON public.certificate_supporting_images FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- Certificate Analysis Logs
-- ============================================
CREATE TABLE IF NOT EXISTS public.certificate_analysis_logs (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  certificate_id UUID REFERENCES public.certificates(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cert_analysis_logs_cert
  ON public.certificate_analysis_logs(certificate_id);

CREATE INDEX IF NOT EXISTS idx_cert_analysis_logs_created
  ON public.certificate_analysis_logs(created_at DESC);

-- RLS for analysis logs
ALTER TABLE public.certificate_analysis_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read analysis logs"
  ON public.certificate_analysis_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth insert analysis logs"
  ON public.certificate_analysis_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT ALL ON public.certificate_supporting_images TO anon, authenticated, service_role;
GRANT ALL ON public.certificate_analysis_logs TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';

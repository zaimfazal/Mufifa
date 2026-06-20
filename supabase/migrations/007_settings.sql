-- Migration: Create competition_settings table
-- Description: Singleton table to manage global tournament state (submission deadlines, registration toggles).

CREATE TABLE competition_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE, -- Enforces a single row
  submission_deadline TIMESTAMPTZ,
  registrations_open BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT competition_settings_singleton CHECK (id = TRUE)
);

-- Insert the initial singleton row (Deadline null by default)
INSERT INTO competition_settings (id, submission_deadline, registrations_open)
VALUES (TRUE, NULL, TRUE);

-- RLS Policies
ALTER TABLE competition_settings ENABLE ROW LEVEL SECURITY;

-- 1. Public can read settings (e.g. for homepage/dashboard)
CREATE POLICY "Public read access to competition_settings" 
ON competition_settings FOR SELECT 
TO public 
USING (true);

-- 2. Only authenticated admins can update
CREATE POLICY "Admin update access to competition_settings" 
ON competition_settings FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND role = 'admin'
  )
);

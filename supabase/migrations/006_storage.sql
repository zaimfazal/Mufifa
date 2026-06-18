-- Create storage bucket for prediction files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prediction-files', 'prediction-files', false)
ON CONFLICT (id) DO NOTHING;


-- Allow users to upload to their own team's folder
CREATE POLICY "Users can upload to their team folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'prediction-files' AND
    (SELECT owner_id FROM teams WHERE id::text = (string_to_array(name, '/'))[1]) = auth.uid()
  );

-- Allow admins to read all files
CREATE POLICY "Admins can read all prediction files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'prediction-files' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

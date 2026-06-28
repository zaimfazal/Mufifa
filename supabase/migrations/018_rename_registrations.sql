-- 018_rename_registrations.sql

ALTER TABLE competition_settings RENAME COLUMN registrations_open TO submissions_open;

-- Fix audit_logs actor_id foreign key constraint
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_id_fkey;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL;

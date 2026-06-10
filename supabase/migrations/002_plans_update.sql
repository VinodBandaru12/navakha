-- Add basic and power to the plan enum, fix free tier defaults

-- Drop existing plan check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;

-- Re-add with all 4 plans
ALTER TABLE profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'basic', 'pro', 'power'));

-- Fix messages_limit default to 20 (was 50 in initial migration)
ALTER TABLE profiles ALTER COLUMN messages_limit SET DEFAULT 20;

-- Fix existing free users who got the wrong default of 50
UPDATE profiles
SET messages_limit = 20
WHERE plan = 'free' AND messages_limit = 50;

-- Track emails of deleted accounts to prevent free-tier re-registration
CREATE TABLE IF NOT EXISTS deleted_emails (
  email TEXT PRIMARY KEY,
  deleted_at TIMESTAMPTZ DEFAULT now()
);

-- Update plan constraint to include new plans
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'base', 'pro', 'power'));

-- Update free plan limits (20 messages, 2 docs)
UPDATE profiles
SET messages_limit = 20, docs_limit = 2
WHERE plan = 'free' AND messages_limit = 50;

-- RPC: delete own account and record email to block re-registration
-- SECURITY DEFINER lets this run as the function owner (can delete auth.users)
CREATE OR REPLACE FUNCTION delete_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email TEXT;
BEGIN
  SELECT email INTO _email FROM profiles WHERE id = auth.uid();

  -- Record email so the user cannot create a new free account with same email
  IF _email IS NOT NULL THEN
    INSERT INTO deleted_emails (email) VALUES (_email)
    ON CONFLICT (email) DO NOTHING;
  END IF;

  -- Delete all user data (cascades via FK to conversations, messages, documents)
  DELETE FROM profiles WHERE id = auth.uid();

  -- Delete auth user
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION delete_account() TO authenticated;

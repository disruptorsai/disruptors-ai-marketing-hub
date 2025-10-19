-- Automatic Admin Role Granting for @disruptorsmedia.com Emails
-- Created: 2025-10-16
-- Purpose: Automatically grant admin role to team members when they sign up

-- ============================================================================
-- FUNCTION: Auto-grant admin role to @disruptorsmedia.com emails
-- ============================================================================
-- This function runs automatically when a new user signs up
-- If their email ends with @disruptorsmedia.com, they get admin role

CREATE OR REPLACE FUNCTION public.auto_grant_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the email ends with @disruptorsmedia.com
  IF NEW.email ILIKE '%@disruptorsmedia.com' THEN
    -- Update user metadata to add admin role
    NEW.raw_user_meta_data = jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"'::jsonb
    );

    -- Log the admin role grant to telemetry
    INSERT INTO public.telemetry_events (area, name, payload)
    VALUES (
      'admin',
      'admin_role_auto_granted',
      jsonb_build_object(
        'user_id', NEW.id,
        'email', NEW.email,
        'timestamp', NOW()
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- TRIGGER: Apply function on user creation
-- ============================================================================
-- This trigger fires BEFORE a user is inserted into auth.users
-- Giving us a chance to modify the user metadata before they're created

DROP TRIGGER IF EXISTS auto_grant_admin_role_trigger ON auth.users;

CREATE TRIGGER auto_grant_admin_role_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_grant_admin_role();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.auto_grant_admin_role() IS
'Automatically grants admin role to users with @disruptorsmedia.com email addresses during signup';

COMMENT ON TRIGGER auto_grant_admin_role_trigger ON auth.users IS
'Fires before user creation to auto-grant admin role to @disruptorsmedia.com emails';

-- ============================================================================
-- TESTING QUERY (Run this to verify it works)
-- ============================================================================
-- After applying this migration, create a test user with @disruptorsmedia.com email
-- and verify they automatically have admin role:
--
-- SELECT
--   email,
--   raw_user_meta_data->>'role' as role,
--   created_at
-- FROM auth.users
-- WHERE email ILIKE '%@disruptorsmedia.com'
-- ORDER BY created_at DESC
-- LIMIT 10;

-- ============================================================================
-- ROLLBACK (If you need to disable auto-granting)
-- ============================================================================
-- To disable this feature, run:
-- DROP TRIGGER IF EXISTS auto_grant_admin_role_trigger ON auth.users;
-- DROP FUNCTION IF EXISTS public.auto_grant_admin_role();

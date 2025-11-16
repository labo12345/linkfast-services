-- Create trigger to send notification when driver is verified
CREATE OR REPLACE FUNCTION public.notify_driver_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If driver is being verified (is_verified changed from false to true)
  IF NEW.is_verified = TRUE AND (OLD.is_verified IS NULL OR OLD.is_verified = FALSE) THEN
    -- Send notification to driver
    PERFORM public.create_notification(
      NEW.user_id,
      'Driver Verification Approved! 🎉',
      'Congratulations! Your driver application has been approved. You can now go online and start accepting ride requests.',
      'success'
    );
  END IF;
  
  -- If driver is being unverified (is_verified changed from true to false)
  IF NEW.is_verified = FALSE AND OLD.is_verified = TRUE THEN
    -- Send notification to driver
    PERFORM public.create_notification(
      NEW.user_id,
      'Driver Verification Revoked',
      'Your driver verification has been revoked. Please contact support for more information.',
      'warning'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS driver_verification_notification ON public.drivers;
CREATE TRIGGER driver_verification_notification
AFTER UPDATE ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION public.notify_driver_verification();

-- Create trigger to notify admin of new driver applications
CREATE OR REPLACE FUNCTION public.notify_admin_new_driver()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Get all admin user IDs and send notification
  FOR admin_id IN 
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    PERFORM public.create_notification(
      admin_id,
      'New Driver Application',
      'A new driver has submitted their application and is awaiting verification.',
      'info'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new driver applications
DROP TRIGGER IF EXISTS new_driver_notification ON public.drivers;
CREATE TRIGGER new_driver_notification
AFTER INSERT ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_driver();
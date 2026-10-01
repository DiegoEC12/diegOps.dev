CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  SELECT auth.uid(), 'admin'::public.app_role
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN public.has_role(auth.uid(), 'admin');
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
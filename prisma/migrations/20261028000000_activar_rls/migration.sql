-- Seguridad: RLS activado en todas las tablas del esquema public.
-- Bloquea el acceso desde la API pública de Supabase (anon key). La web usa
-- Prisma con el usuario dueño de las tablas, que no se ve afectado.
-- IMPORTANTE: cada tabla nueva que se agregue debe llevar también
--   ALTER TABLE "NuevaTabla" ENABLE ROW LEVEL SECURITY;
DO $rls$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END
$rls$;

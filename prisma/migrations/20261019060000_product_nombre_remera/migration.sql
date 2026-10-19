-- Todos los productos se llaman "Remera …".
-- 1) Trigger: al crear o editar un producto, si el nombre no empieza con
--    "Remera"/"Remeras", se le agrega adelante. Vale para el panel de admin
--    y para cualquier otra carga.
-- 2) Corrige los productos que ya existen. Los slugs (links) no cambian.

CREATE OR REPLACE FUNCTION "product_nombre_con_remera"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."nombre" := regexp_replace(btrim(NEW."nombre"), '\s+', ' ', 'g');
  IF NEW."nombre" <> '' AND NEW."nombre" !~* '^remeras?(\s|$)' THEN
    NEW."nombre" := 'Remera ' || NEW."nombre";
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "product_nombre_con_remera" ON "Product";

CREATE TRIGGER "product_nombre_con_remera"
BEFORE INSERT OR UPDATE OF "nombre" ON "Product"
FOR EACH ROW
EXECUTE FUNCTION "product_nombre_con_remera"();

UPDATE "Product"
SET "nombre" = "nombre"
WHERE btrim("nombre") !~* '^remeras?(\s|$)';

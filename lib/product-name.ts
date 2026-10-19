/**
 * Todos los productos se llaman "Remera …" (ej.: "Remera Naruto").
 * Si el nombre ya empieza con "Remera" o "Remeras", se deja como está.
 * La base de datos aplica la misma regla con un trigger, así que vale
 * para cualquier producto que se cargue o edite, por donde sea.
 */
const REMERA_PREFIX = /^remeras?(\s|$)/i;

export function withRemeraPrefix(nombre: string) {
  const clean = String(nombre || '').trim().replace(/\s+/g, ' ');
  if (!clean || REMERA_PREFIX.test(clean)) return clean;
  return `Remera ${clean}`;
}

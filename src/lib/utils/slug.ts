/**
 * Genera un slug a partir de un texto
 * Convierte a minúsculas, reemplaza espacios y caracteres especiales por guiones
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplaza caracteres no alfanuméricos por guiones
    .replace(/^-+|-+$/g, ''); // Elimina guiones al inicio y final
}


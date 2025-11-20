import { format, formatDistance, formatRelative, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

const locales = {
  es,
  en: enUS,
};

export type Locale = 'es' | 'en';

export function formatDate(date: Date | string, formatStr: string = 'PP', locale: Locale = 'es'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: locales[locale] });
}

export function formatDateDistance(
  date: Date | string,
  baseDate: Date = new Date(),
  locale: Locale = 'es'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, baseDate, { locale: locales[locale], addSuffix: true });
}

export function formatDateRelative(date: Date | string, locale: Locale = 'es'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatRelative(dateObj, new Date(), { locale: locales[locale] });
}


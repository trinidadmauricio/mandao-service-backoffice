import { useTranslation as useNextI18nextTranslation } from 'next-i18next';

export function useTranslation(namespace?: string) {
  const { t, i18n, ready } = useNextI18nextTranslation(namespace);

  return {
    t,
    i18n,
    ready,
    locale: i18n.language,
    changeLocale: (locale: string) => {
      i18n.changeLanguage(locale);
    },
  };
}


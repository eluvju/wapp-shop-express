import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      seo: {
        title: 'Product Catalog',
        description: 'Modern product catalog with PWA experience'
      },
      language: {
        en: 'English',
        pt: 'Português'
      },
      actions: {
        addToCart: 'Add to Cart',
        loading: 'Loading...'
      }
    }
  },
  'pt-BR': {
    translation: {
      seo: {
        title: 'Catálogo de Produtos',
        description: 'Catálogo moderno de produtos com experiência PWA'
      },
      language: {
        en: 'Inglês',
        pt: 'Português'
      },
      actions: {
        addToCart: 'Adicionar ao Carrinho',
        loading: 'Carregando...'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lng',
      caches: ['localStorage']
    }
  });

// keep <html lang> in sync
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng || 'pt-BR';
  }
});

export default i18n;

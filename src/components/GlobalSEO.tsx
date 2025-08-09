import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function upsertMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  let el = document.querySelector(`link[rel="${rel}"]${hreflang ? `[hreflang="${hreflang}"]` : ''}`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export const GlobalSEO = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const title = t('seo.title');
    const description = t('seo.description');
    document.title = title;
    upsertMeta('description', description);

    const url = window.location.origin + location.pathname + location.search;
    upsertLink('canonical', url);

    // hreflang alternates using query param
    const basePath = window.location.origin + location.pathname;
    upsertLink('alternate', `${basePath}?lng=pt-BR`, 'pt-BR');
    upsertLink('alternate', `${basePath}?lng=en`, 'en');

    // Structured Data (WebSite)
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: title,
      url: window.location.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${window.location.origin}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    let script = document.getElementById('ld-website');
    if (!script) {
      script = document.createElement('script');
      script.id = 'ld-website';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(ld);

    // Track page view
    const dl = (window as any).dataLayer;
    if (dl) {
      dl.push({ event: 'page_view', page_path: location.pathname, language: i18n.language });
    }
  }, [location, t, i18n.language]);

  return null;
};
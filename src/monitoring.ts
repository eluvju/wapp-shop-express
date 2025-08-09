import * as Sentry from '@sentry/react';

// Read configuration from <meta> tags to avoid env vars
function getMeta(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const tag = document.querySelector(`meta[name="${name}"]`);
  return tag?.getAttribute('content');
}

export function initMonitoring() {
  // Sentry
  const sentryDsn = getMeta('sentry-dsn');
  if (sentryDsn) {
    try {
      Sentry.init({
        dsn: sentryDsn,
        tracesSampleRate: 0.1,
        integrations: [],
      });
      // eslint-disable-next-line no-console
      console.log('[monitoring] Sentry initialized');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[monitoring] Failed to initialize Sentry', e);
    }
  }

  // GA4
  const gaId = getMeta('ga-measurement-id');
  if (gaId && !window.dataLayer) {
    (function(w:any,d:any,s:string,l:string,i:string){
      w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
      const f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
      j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl; f.parentNode?.insertBefore(j,f);
    })(window, document, 'script', 'dataLayer', gaId);
    // eslint-disable-next-line no-console
    console.log('[monitoring] GA4 initialized');
  }
}

export function sendWebVitalToGA({ name, value, id }: { name: string; value: number; id: string }) {
  const gaId = getMeta('ga-measurement-id');
  if (!gaId || !(window as any).dataLayer) return;
  (window as any).dataLayer.push({
    event: 'web_vitals',
    metric_name: name,
    metric_value: Math.round(name === 'CLS' ? value * 1000 : value),
    metric_id: id,
  });
}

export { Sentry };
import i18n from '@/i18n';

export function formatCurrency(value: number) {
  const lng = i18n.language || 'pt-BR';
  const currency = lng.startsWith('en') ? 'USD' : 'BRL';
  return new Intl.NumberFormat(lng, { style: 'currency', currency }).format(value);
}

export function formatDate(date: string | number | Date, options?: Intl.DateTimeFormatOptions) {
  const lng = i18n.language || 'pt-BR';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat(lng, { dateStyle: 'medium', ...(options || {}) }).format(d);
}
// src/utils/format.js
//
// Small formatting helpers shared across components.

export function formatMonthDay(date, lang) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  try {
    return new Intl.DateTimeFormat(lang || 'en', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

export function coverImageUrl(cover) {
  if (!cover) return '';
  if (typeof cover === 'string') return cover;
  if (typeof cover === 'object' && cover.url) return String(cover.url);
  return '';
}

// Format a price + currency for display, e.g. 4500 + 'NOK' → "4 500 NOK".
// Returns '' when there's no price (null/0/undefined).
export function formatPrice(price, currency = 'NOK', lang) {
  if (price == null || price === '' || Number(price) === 0) return '';
  const n = Number(price);
  if (Number.isNaN(n)) return '';
  let formatted;
  try {
    formatted = new Intl.NumberFormat(lang || 'nb-NO', {
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    formatted = String(n);
  }
  return `${formatted} ${currency || ''}`.trim();
}
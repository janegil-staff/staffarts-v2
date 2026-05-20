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
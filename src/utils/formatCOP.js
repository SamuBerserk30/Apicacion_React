export function formatCOP(value) {
  const numericValue = typeof value === 'string' ? Number(value.replace(/[^0-9.-]+/g, '')) : value;

  if (!Number.isFinite(numericValue)) return '';

  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    currencyDisplay: 'code',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);

  // Intl often uses a non-breaking space between currency and value.
  return formatted.replace(/\u00A0/g, ' ');
}

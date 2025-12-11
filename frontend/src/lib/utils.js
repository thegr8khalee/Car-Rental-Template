export function formatTime(date) {
  return new Intl.DateTimeFormat(navigator.language, {
    year: 'numeric',
    month: 'long', // or 'short' or '2-digit'
    day: '2-digit',
  }).format(new Date(date));
}

export const formatPrice = (price) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
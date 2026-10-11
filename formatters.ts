export function formatFollowers(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(num >= 100_000 ? 0 : 1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

export function formatCurrency(amount: number | undefined, currency: string = 'USD'): string {
  if (!amount) return 'Custom quote';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getTransactionIcon(type?: string): string {
  switch (type) {
    case 'payment':
      return '💳';
    case 'request':
      return '📩';
    case 'topup':
      return '💸';
    case 'payout':
      return '🏦';
    case 'refund':
      return '↩️';
    default:
      return '🔔';
  }
}

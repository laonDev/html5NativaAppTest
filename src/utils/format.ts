export const formatCurrency = (amount: number): string => {
  return `£${(amount / 1000).toFixed(2)}`;
};

export const formatViccon = (amount: number): string => {
  return (amount / 1000).toFixed(2);
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const formatBadgeCount = (count: number): string => {
  return count > 99 ? '99+' : String(count);
};

export const formatCountdown = (endTime: string): string => {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return '00:00:00';

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const getMultiplierColor = (multi: number): string => {
  if (multi < 2.0) return '#22c55e';
  if (multi < 5.0) return '#06b6d4';
  return '#ef4444';
};

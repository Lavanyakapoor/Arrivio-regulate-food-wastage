// Expiry helper utilities

/**
 * Returns the number of days until expiry (negative = already expired)
 */
const getDaysUntilExpiry = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Returns expiry status based on days remaining
 */
const getExpiryStatus = (days) => {
  if (days < 0) return 'expired';
  if (days <= 3) return 'critical';
  if (days <= 7) return 'warning';
  return 'fresh';
};

/**
 * Returns Tailwind color class for a given status
 */
const getExpiryColor = (status) => {
  switch (status) {
    case 'expired':  return 'bg-red-900/40 text-red-300 border-red-700/50';
    case 'critical': return 'bg-orange-900/40 text-orange-300 border-orange-700/50';
    case 'warning':  return 'bg-amber-900/40 text-amber-300 border-amber-700/50';
    case 'fresh':    return 'bg-green-900/40 text-green-300 border-green-700/50';
    default:         return 'bg-gray-800/40 text-gray-400 border-gray-700/50';
  }
};

/**
 * Returns a hex color for status (for border/dot accents)
 */
const getExpiryHex = (status) => {
  switch (status) {
    case 'expired':  return '#ef4444';
    case 'critical': return '#f97316';
    case 'warning':  return '#f59e0b';
    case 'fresh':    return '#22c55e';
    default:         return '#94a3b8';
  }
};

export { getDaysUntilExpiry, getExpiryStatus, getExpiryColor, getExpiryHex };

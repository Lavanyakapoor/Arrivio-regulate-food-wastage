import PropTypes from 'prop-types';
import { getDaysUntilExpiry, getExpiryStatus, getExpiryColor } from '../utils/helper';

export default function ExpiryBadge({ expiryDate, size = 'sm' }) {
  const days   = getDaysUntilExpiry(expiryDate);
  const status = getExpiryStatus(days);
  const color  = getExpiryColor(status);

  let label;
  if (days < 0)        label = `Expired ${Math.abs(days)}d ago`;
  else if (days === 0) label = 'Expires today!';
  else if (days === 1) label = 'Tomorrow';
  else                 label = `${days}d left`;

  const dot = {
    expired:  'bg-red-500',
    critical: 'bg-orange-500',
    warning:  'bg-amber-500',
    fresh:    'bg-green-500',
  }[status] || 'bg-gray-400';

  return (
    <span className={`_pill ${color} gap-1.5 ${size === 'lg' ? 'text-sm px-3 py-1' : ''} animate-badge-pop`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === 'critical' || status === 'expired' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

ExpiryBadge.propTypes = {
  expiryDate: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'lg']),
};

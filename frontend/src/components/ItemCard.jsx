import PropTypes from 'prop-types';
import { useState } from 'react';
import { FiTrash2, FiGift, FiCalendar, FiPackage } from 'react-icons/fi';
import ExpiryBadge from './ExpiryBadge';
import { getDaysUntilExpiry, getExpiryStatus, getExpiryHex } from '../utils/helper';

const CATEGORY_ICONS = {
  dairy: '🥛', produce: '🥦', meat: '🥩', snacks: '🍪',
  beverages: '🧃', grains: '🌾', frozen: '🧊', medicine: '💊', other: '📦',
};

function getBarWidth(days) {
  if (days <= 0)  return 0;
  if (days >= 30) return 100;
  return Math.round((days / 30) * 100);
}

export default function ItemCard({ item, onDelete, onDonate }) {
  const [deleting, setDeleting] = useState(false);

  const days    = getDaysUntilExpiry(item.expiryDate);
  const status  = getExpiryStatus(days);
  const hex     = getExpiryHex(status);
  const icon    = CATEGORY_ICONS[item.category?.toLowerCase()] || '📦';
  const barW    = getBarWidth(days);

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => onDelete?.(item._id), 260);
  };

  return (
    <div
      className={`_card-base flex flex-col gap-0 overflow-hidden transition-all duration-300
        ${deleting ? 'opacity-0 scale-90 pointer-events-none' : ''}`}
    >
      {/* colour accent strip */}
      <div className="h-1 w-full" style={{ backgroundColor: hex }} />

      <div className="p-4 flex flex-col gap-3">
        {/* Top row */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-200 hover:scale-110"
            style={{ backgroundColor: `${hex}22` }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-100 leading-tight truncate">{item.name}</h3>
            <p className="text-xs text-gray-500 capitalize mt-0.5">{item.category}</p>
          </div>
          <ExpiryBadge expiryDate={item.expiryDate} />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FiPackage size={11} className="text-gray-600" />
            {item.quantity} {item.unit}
          </span>
          <span className="text-gray-700">|</span>
          <span className="flex items-center gap-1">
            <FiCalendar size={11} className="text-gray-600" />
            {new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Expiry progress bar */}
        <div className="bg-white/8 rounded-full overflow-hidden" style={{ height: 4 }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${barW}%`, backgroundColor: hex }}
          />
        </div>
        <p className="text-[10px] text-gray-600 -mt-1.5">
          {days < 0
            ? `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
            : days === 0
            ? 'Expires today'
            : `${barW}% shelf life remaining`}
        </p>

        {/* Actions */}
        {!item.donated ? (
          <div className="flex gap-2 mt-0.5">
            {status !== 'expired' && onDonate && (
              <button
                onClick={() => onDonate(item)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 rounded-xl py-2 transition-all active:scale-95"
              >
                <FiGift size={12} /> Donate
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center justify-center text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 rounded-xl py-2 px-3 transition-all active:scale-95"
              >
                <FiTrash2 size={13} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 rounded-xl px-3 py-2 border border-indigo-500/20 animate-badge-pop">
            <FiGift size={12} /> Listed for community donation
          </div>
        )}
      </div>
    </div>
  );
}

ItemCard.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    unit: PropTypes.string.isRequired,
    expiryDate: PropTypes.string.isRequired,
    donated: PropTypes.bool,
  }).isRequired,
  onDelete: PropTypes.func,
  onDonate: PropTypes.func,
};

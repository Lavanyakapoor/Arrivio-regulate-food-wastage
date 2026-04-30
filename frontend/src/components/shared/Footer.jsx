import { Link } from 'react-router-dom';
import { FiPackage, FiGrid, FiGift, FiPlusCircle, FiHeart } from 'react-icons/fi';

const LINKS = [
  { to: '/', label: 'Dashboard', icon: FiGrid },
  { to: '/inventory', label: 'Inventory', icon: FiPackage },
  { to: '/add-item', label: 'Add Item', icon: FiPlusCircle },
  { to: '/donate', label: 'Donate', icon: FiGift },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0d0d28] mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

          {/* Brand */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-white text-xs font-black">A</span>
              </div>
              <span className="font-black text-lg text-indigo-400">
                Arrivio
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-xs">
              Track household expiry dates, reduce waste, and donate near-expiry items to your community.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {LINKS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-400 transition-colors">
                <Icon size={12} /> {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <span>&copy; {new Date().getFullYear()} Arrivio — reduce waste, donate more.</span>
          <span className="flex items-center gap-1">
            Made with <FiHeart size={11} className="text-red-500" /> to fight food waste
          </span>
        </div>
      </div>
    </footer>
  );
}

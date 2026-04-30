import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiPackage, FiGrid, FiGift, FiPlusCircle, FiLogOut, FiLogIn, FiMenu, FiX, FiBarChart2 } from 'react-icons/fi';

const NAV = [
  { to: '/',          label: 'Dashboard', icon: FiGrid },
  { to: '/inventory', label: 'Inventory', icon: FiPackage },
  { to: '/donate',    label: 'Donate',    icon: FiGift },
  { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/add-item',  label: 'Add Item',  icon: FiPlusCircle, cta: true },
];

export default function Header() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setLoggedIn(localStorage.getItem('login') != null);
  }, [location]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('login');
    setLoggedIn(false);
    setMenuOpen(false);
    navigate('/login');
  };

  const isActive = (to) => location.pathname === to;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300
        ${scrolled
          ? 'glass border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-[#09091e]/90 border-b border-white/5'}`}
    >
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 group-hover:scale-110 transition-transform">
            <span className="text-white text-sm font-black">A</span>
          </div>
          <span className="text-xl font-black tracking-tight hidden sm:block text-indigo-400">
            Arrivio
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon, cta }) => (
            cta ? (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-lg
                  ${isActive(to)
                    ? 'bg-indigo-500 text-white shadow-indigo-500/40'
                    : 'bg-indigo-500/90 hover:bg-indigo-500 text-white shadow-indigo-500/30'}`}>
                <Icon size={14} /> {label}
              </Link>
            ) : (
              <Link key={to} to={to}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive(to)
                    ? 'text-indigo-300 bg-indigo-500/15'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}>
                <Icon size={14} />
                {label}
                {isActive(to) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400 animate-badge-pop" />
                )}
              </Link>
            )
          ))}
        </nav>

        {/* Auth */}
        <div className="hidden md:flex items-center">
          {loggedIn ? (
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-400 transition-colors px-3 py-2 rounded-xl hover:bg-red-500/10">
              <FiLogOut size={14} /> Logout
            </button>
          ) : (
            <Link to="/login"
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/30 active:scale-95">
              <FiLogIn size={14} /> Login
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-xl text-gray-400 hover:bg-white/8 transition-colors"
          onClick={() => setMenuOpen(o => !o)}
        >
          <span className={`block transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''}`}>
            {menuOpen ? <FiX size={21} /> : <FiMenu size={21} />}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d0d28]/98 backdrop-blur-xl border-t border-white/5 px-4 py-3 flex flex-col gap-1 animate-fade-down shadow-2xl">
          {NAV.map(({ to, label, icon: Icon, cta }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive(to) ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
                ${cta ? 'bg-indigo-500 text-white hover:bg-indigo-400 mt-1 shadow-lg shadow-indigo-500/30' : ''}`}>
              <Icon size={15} /> {label}
            </Link>
          ))}
          <div className="border-t border-white/5 mt-2 pt-2">
            {loggedIn ? (
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full">
                <FiLogOut size={14} /> Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-400 hover:bg-indigo-500/10">
                <FiLogIn size={14} /> Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchItems } from '../store/inventory';
import { fetchAnalytics } from '../store/analytics';
import { getDaysUntilExpiry, getExpiryStatus, getExpiryHex } from '../utils/helper';
import ExpiryBadge from '../components/ExpiryBadge';
import {
  FiPackage, FiAlertTriangle, FiXCircle, FiCheckCircle,
  FiPlus, FiChevronRight, FiChevronLeft, FiGift,
  FiTrendingUp, FiList, FiRefreshCw, FiActivity, FiBarChart2,
} from 'react-icons/fi';

/* ─────────────── FOOD WASTE TIPS ─────────────── */
const TIPS = [
  { icon: '🌡️', title: 'Store smarter', tip: 'Keep dairy on middle shelves — the door is 5°C warmer and causes faster spoilage.' },
  { icon: '🥶', title: 'Freeze before it expires', tip: 'Most foods can be frozen right before their expiry date to extend life by months.' },
  { icon: '📋', title: 'FIFO method', tip: 'First In, First Out — always move older items to the front of your fridge and pantry.' },
  { icon: '🔢', title: '"Best before" ≠ unsafe', tip: 'Most food is still perfectly fine days after a best-before date. Trust your senses.' },
  { icon: '♻️', title: 'Compost what you can\'t eat', tip: 'Items too far gone? Compost them — far better than sending organic matter to landfill.' },
  { icon: '🛒', title: 'Check before you shop', tip: 'Open Arrivio before grocery runs to avoid buying duplicates of items you already have.' },
  { icon: '🥗', title: 'Use the scraps', tip: 'Vegetable peels, cheese rinds, herb stems — most scraps become broth, pesto, or chips.' },
  { icon: '🍌', title: 'Overripe = opportunity', tip: 'Browning bananas make the best smoothies and banana bread. Never throw them away.' },
];

/* ─────────────── QUICK ACTIONS ─────────────── */
const ACTIONS = [
  { to: '/add-item',  label: 'Add Item',     icon: FiPlus,       grad: 'from-indigo-500 to-violet-600',  sub: 'Scan or browse catalog' },
  { to: '/inventory', label: 'My Inventory', icon: FiList,       grad: 'from-cyan-500 to-blue-600',      sub: 'View & manage items' },
  { to: '/donate',    label: 'Donate',       icon: FiGift,       grad: 'from-pink-500 to-rose-600',      sub: 'Share with community' },
  { to: '/donate',    label: 'Find NGOs',    icon: FiTrendingUp, grad: 'from-emerald-400 to-green-600',  sub: 'Nearby food banks' },
];

/* ─────────────── CATEGORY EMOJI MAP ─────────────── */
const CAT_EMOJI = {
  dairy:'🥛', produce:'🥦', meat:'🥩', snacks:'🍪',
  beverages:'🧃', grains:'🌾', frozen:'🧊', medicine:'💊', other:'📦',
};

/* ─────────────── LAUNCH FOOD LIST ─────────────── */
const LAUNCH_FOOD = ['🥛','🥦','🍎','🍌','🧀','🥕','🍅','🥚','🫙','🌽','🥑','🍇','🫐','🍊','🥩'];

/* ─────────────── STAR FIELD ─────────────── */
const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top:  `${(i * 7.3 + 3) % 95}%`,
  left: `${(i * 11.7 + 2) % 96}%`,
  size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
  delay: `${(i * 0.13) % 3}s`,
  dur:   `${1.5 + (i % 4) * 0.5}s`,
}));

/* ─────────────── FLYING FOOD EMOJI ─────────────── */
function LaunchEmoji({ emoji, x, delay }) {
  return (
    <span
      className="absolute pointer-events-none select-none text-2xl anim-start"
      style={{
        bottom: '8%',
        left: `${x}%`,
        animation: `launchUp 2.2s ease-out ${delay}ms forwards`,
      }}
    >
      {emoji}
    </span>
  );
}

/* ─────────────── SHOOTING STAR ─────────────── */
function ShootingStar() {
  const [active, setActive] = useState(false);
  const [top, setTop] = useState(30);

  useEffect(() => {
    const fire = () => {
      setTop(10 + Math.random() * 55);
      setActive(true);
      setTimeout(() => setActive(false), 1600);
    };
    const t1 = setTimeout(fire, 1200);
    const t2 = setInterval(fire, 5500);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);

  if (!active) return null;
  return (
    <div
      className="absolute pointer-events-none rounded-full"
      style={{
        top: `${top}%`,
        left: 0,
        height: '2px',
        width: '120px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), rgba(165,180,252,0.6), transparent)',
        animation: 'shootStar 1.3s ease-out forwards',
        filter: 'blur(0.5px)',
      }}
    />
  );
}

/* ─────────────── ANIMATED COUNTER ─────────────── */
function AnimatedCount({ target, duration = 900 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      setCount(cur);
      if (cur >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return <>{count}</>;
}

/* ─────────────── HEALTH RING ─────────────── */
function HealthRing({ fresh, total }) {
  const pct = total === 0 ? 0 : Math.round((fresh / total) * 100);
  const r = 38, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? '#4ade80' : pct >= 40 ? '#fbbf24' : '#f87171';
  const label = pct >= 70 ? 'Healthy' : pct >= 40 ? 'Fair' : 'Needs attention';

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1e1e42" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-black text-gray-100">{pct}%</span>
        <span className="text-[10px] text-gray-500">fresh</span>
      </div>
      <p className="text-xs font-semibold mt-1" style={{ color }}>{label}</p>
    </div>
  );
}

/* ─────────────── SCROLL LANE ─────────────── */
function ScrollLane({ title, items, borderHex, emptyMsg }) {
  const ref = useRef(null);
  const scroll = d => ref.current?.scrollBy({ left: d * 200, behavior: 'smooth' });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="font-bold text-gray-300 flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: borderHex, boxShadow: `0 0 6px ${borderHex}80` }} />
          {title}
          <span className="text-xs font-normal text-gray-600">({items.length})</span>
        </h2>
        <div className="flex gap-1 items-center">
          <button onClick={() => scroll(-1)} className="p-1 rounded-lg hover:bg-white/8 text-gray-600 transition-colors"><FiChevronLeft size={15} /></button>
          <button onClick={() => scroll(1)}  className="p-1 rounded-lg hover:bg-white/8 text-gray-600 transition-colors"><FiChevronRight size={15} /></button>
          <Link to="/inventory" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 ml-1 neon-link">All →</Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-[#111127] border border-[#252550] rounded-2xl px-5 py-5 text-center text-gray-600 text-sm">{emptyMsg}</div>
      ) : (
        <div ref={ref} className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {items.map((item, i) => {
            const days  = getDaysUntilExpiry(item.expiryDate);
            const hex   = getExpiryHex(getExpiryStatus(days));
            const emoji = CAT_EMOJI[item.category?.toLowerCase()] || '📦';
            return (
              <div
                key={item._id}
                className="flex-shrink-0 w-40 bg-[#131330] rounded-2xl border border-[#252550] p-3 flex flex-col gap-2 hover:shadow-xl hover:border-[#3d3d70] transition-all anim-start animate-fade-up"
                style={{ borderLeftColor: hex, borderLeftWidth: '3px', animationDelay: `${i * 50}ms`, animationFillMode: 'forwards', boxShadow: `0 0 0 rgba(0,0,0,0)` }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{emoji}</span>
                  <p className="font-semibold text-gray-200 text-xs leading-tight truncate">{item.name}</p>
                </div>
                <ExpiryBadge expiryDate={item.expiryDate} />
                <p className="text-[10px] text-gray-600">{item.quantity} {item.unit}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────── TIP CARD ─────────────── */
function TipCard() {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const cycle = (dir = 1) => {
    setFading(true);
    setTimeout(() => {
      setIdx(i => (i + dir + TIPS.length) % TIPS.length);
      setFading(false);
    }, 250);
  };

  useEffect(() => {
    const t = setInterval(() => cycle(1), 6000);
    return () => clearInterval(t);
  }, []);

  const tip = TIPS[idx];
  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/30 border border-indigo-500/20 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">💡 Food Tip</span>
        <div className="flex gap-1">
          <button onClick={() => cycle(-1)} className="p-1 rounded-lg hover:bg-indigo-500/20 text-indigo-400 transition-colors"><FiChevronLeft size={13} /></button>
          <button onClick={() => cycle(1)}  className="p-1 rounded-lg hover:bg-indigo-500/20 text-indigo-400 transition-colors"><FiChevronRight size={13} /></button>
        </div>
      </div>
      <div className={`transition-opacity duration-250 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{tip.icon}</span>
          <div>
            <p className="font-bold text-gray-200 text-sm">{tip.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{tip.tip}</p>
          </div>
        </div>
        <div className="flex gap-1 mt-3">
          {TIPS.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === idx ? 'w-6 bg-indigo-400' : 'w-2 bg-indigo-900'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── UPCOMING TIMELINE ─────────────── */
function UpcomingTimeline({ items }) {
  const upcoming = [...items]
    .filter(i => getDaysUntilExpiry(i.expiryDate) >= 0)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
    .slice(0, 6);

  if (upcoming.length === 0) return null;

  return (
    <div className="bg-[#131330] rounded-2xl border border-[#252550] p-4 mb-6">
      <h3 className="font-bold text-gray-300 text-sm mb-3 flex items-center gap-2">
        <FiTrendingUp size={14} className="text-indigo-400" /> Upcoming Expirations
      </h3>
      <div className="space-y-2">
        {upcoming.map((item, i) => {
          const days = getDaysUntilExpiry(item.expiryDate);
          const hex  = getExpiryHex(getExpiryStatus(days));
          const emoji = CAT_EMOJI[item.category?.toLowerCase()] || '📦';
          const dateStr = new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return (
            <div
              key={item._id}
              className="flex items-center gap-3 anim-start animate-slide-left"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
            >
              <div className="w-0.5 self-stretch rounded-full" style={{ backgroundColor: hex, boxShadow: `0 0 4px ${hex}80` }} />
              <span className="text-base">{emoji}</span>
              <p className="flex-1 text-sm text-gray-200 font-medium truncate">{item.name}</p>
              <span className="text-xs text-gray-600">{dateStr}</span>
              <ExpiryBadge expiryDate={item.expiryDate} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────── FLOATING HERO EMOJI ─────────────── */
const HERO_ITEMS = [
  { e:'🥛', t:'8%',  l:'5%',  delay:'0s',   size:'2rem' },
  { e:'🥦', t:'15%', l:'85%', delay:'0.6s', size:'1.8rem' },
  { e:'🍎', t:'70%', l:'90%', delay:'1.2s', size:'1.6rem' },
  { e:'🧀', t:'80%', l:'3%',  delay:'0.3s', size:'1.5rem' },
  { e:'🥚', t:'45%', l:'92%', delay:'1.8s', size:'1.4rem' },
  { e:'🍌', t:'60%', l:'7%',  delay:'0.9s', size:'1.6rem' },
  { e:'🍅', t:'25%', l:'80%', delay:'1.5s', size:'1.3rem' },
  { e:'🥕', t:'35%', l:'2%',  delay:'2.1s', size:'1.4rem' },
  { e:'🫙', t:'55%', l:'50%', delay:'2.5s', size:'1.2rem' },
  { e:'🌽', t:'20%', l:'40%', delay:'1.0s', size:'1.3rem' },
];

/* ─────────────── STAT META ─────────────── */
const STAT_META = {
  total:    { bg: 'from-indigo-600 to-violet-700', icon: FiPackage,      label: 'Total Items',   sub: 'in your inventory',    glow: '#6366f1' },
  expiring: { bg: 'from-amber-500 to-orange-600',  icon: FiAlertTriangle, label: 'Expiring Soon', sub: 'within 7 days',        glow: '#f59e0b' },
  expired:  { bg: 'from-red-500 to-rose-700',      icon: FiXCircle,      label: 'Expired',       sub: 'needs action',         glow: '#ef4444' },
  fresh:    { bg: 'from-emerald-500 to-green-700', icon: FiCheckCircle,  label: 'Fresh',         sub: 'more than 7 days',     glow: '#22c55e' },
};

/* ─────────────── MAIN DASHBOARD ─────────────── */
export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector(s => s.inventory);
  const { data: analyticsData } = useAppSelector(s => s.analytics);
  const username = localStorage.getItem('login');

  useEffect(() => {
    dispatch(fetchItems());
    dispatch(fetchAnalytics());
  }, [dispatch]);

  // Pre-compute launched emojis on mount
  const launches = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      emoji: LAUNCH_FOOD[i % LAUNCH_FOOD.length],
      x: 3 + (i * 7) % 92,
      delay: i * 180,
    })),
  []);

  const byStatus = s => items.filter(i => getExpiryStatus(getDaysUntilExpiry(i.expiryDate)) === s);
  const expired    = byStatus('expired');
  const critical   = byStatus('critical');
  const warning    = byStatus('warning');
  const fresh      = byStatus('fresh');
  const expiringSoon = [...critical, ...warning];

  const stats = [
    { key: 'total',    value: items.length },
    { key: 'expiring', value: expiringSoon.length },
    { key: 'expired',  value: expired.length },
    { key: 'fresh',    value: fresh.length },
  ];

  const urgentNames = expiringSoon.slice(0, 8).map(i => i.name).join('  ·  ');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
        <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-t-2 border-violet-500" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      <p className="text-sm text-gray-500 animate-pulse">Loading your inventory…</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* ── HERO BANNER ── */}
      <div
        className="relative rounded-3xl overflow-hidden animate-fade-down"
        style={{
          background: 'linear-gradient(135deg, #1a0533 0%, #160b3d 25%, #0e1a52 60%, #041a3d 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease infinite',
          minHeight: '220px',
        }}
      >
        {/* Starfield */}
        {STARS.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white animate-twinkle pointer-events-none"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.dur }}
          />
        ))}

        {/* Glow orbs */}
        <div className="absolute top-[-60px] right-[-40px] w-72 h-72 rounded-full pointer-events-none animate-orb-pulse"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-40px] left-[-30px] w-52 h-52 rounded-full pointer-events-none animate-orb-pulse"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)', animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full pointer-events-none animate-orb-pulse"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)', animationDelay: '1s' }} />

        {/* Spinning ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/5 animate-spin-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/5 animate-spin-slow pointer-events-none"
          style={{ animationDirection: 'reverse', animationDuration: '6s' }} />

        {/* Floating food emojis (persistent) */}
        {HERO_ITEMS.map((h, i) => (
          <div key={i} className="absolute pointer-events-none select-none"
            style={{ top: h.t, left: h.l, fontSize: h.size, opacity: 0.4,
              animation: `float 4s ease-in-out infinite`, animationDelay: h.delay }}>
            {h.e}
          </div>
        ))}

        {/* Shooting star */}
        <ShootingStar />

        {/* Launching food emojis on mount */}
        {launches.map((l, i) => (
          <LaunchEmoji key={i} emoji={l.emoji} x={l.x} delay={l.delay} />
        ))}

        {/* Hero content */}
        <div className="relative px-6 py-8 sm:px-10 z-10">
          <p className="text-indigo-300 text-sm mb-1 animate-fade-down">
            {greeting}{username ? `, ${username}` : ''} 👋
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2 animate-fade-up" style={{ animationDelay: '80ms' }}>
            Your Household<br />
            <span className="gradient-text">Arrivio Dashboard</span>
          </h1>
          <p className="text-indigo-300/80 text-sm mb-6 max-w-sm animate-fade-up" style={{ animationDelay: '160ms' }}>
            {items.length === 0
              ? 'Start adding items to track expiry dates and reduce waste.'
              : `You have ${items.length} item${items.length > 1 ? 's' : ''} tracked. ${expired.length > 0 ? `${expired.length} expired — take action!` : expiringSoon.length > 0 ? `${expiringSoon.length} expiring soon.` : 'All looking fresh! ✅'}`
            }
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
            <Link to="/add-item"
              className="flex items-center gap-2 bg-white text-indigo-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 active:scale-95 transition-all shadow-lg shadow-black/30">
              <FiPlus size={15} /> Add Item
            </Link>
            <Link to="/inventory"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95 border border-white/20">
              <FiList size={15} /> View Inventory
            </Link>
            <Link to="/donate"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95 border border-white/15">
              <FiGift size={15} /> Donate
            </Link>
          </div>
        </div>
      </div>

      {/* ── URGENCY TICKER ── */}
      {expiringSoon.length > 0 && (
        <div className="bg-amber-900/25 border border-amber-500/25 rounded-2xl px-4 py-3 flex items-center gap-3 overflow-hidden animate-fade-up"
          style={{ boxShadow: '0 0 20px rgba(245,158,11,0.1)' }}>
          <span className="text-amber-400 font-bold text-xs whitespace-nowrap uppercase tracking-wide shrink-0 animate-pulse">⚠ Expiring</span>
          <div className="overflow-hidden flex-1">
            <span className="whitespace-nowrap text-amber-300 text-sm animate-ticker inline-block">
              {urgentNames + '  ·  ' + urgentNames}
            </span>
          </div>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ key, value }, i) => {
          const m = STAT_META[key];
          const Icon = m.icon;
          return (
            <div
              key={key}
              className={`relative rounded-2xl p-4 text-white overflow-hidden bg-gradient-to-br ${m.bg} anim-start`}
              style={{
                animationDelay: `${i * 100}ms`,
                animationFillMode: 'forwards',
                animation: `glowPop 0.65s cubic-bezier(0.36,0.07,0.19,0.97) ${i * 100}ms forwards`,
                opacity: 0,
                boxShadow: `0 4px 24px ${m.glow}30`,
              }}
            >
              {/* glow decoration */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full animate-orb-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
              {/* sparkle dot */}
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/60 rounded-full animate-twinkle" style={{ animationDelay: `${i * 0.3}s` }} />

              <Icon size={22} className="mb-2 opacity-80 relative z-10" />
              <p className="text-3xl font-black leading-none mb-0.5 relative z-10">
                <AnimatedCount target={value} />
              </p>
              <p className="text-xs font-semibold opacity-90 relative z-10">{m.label}</p>
              <p className="text-[10px] opacity-60 relative z-10">{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── HEALTH RING + QUICK ACTIONS ── */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Health Score */}
        <div className="bg-[#131330] rounded-2xl border border-[#252550] p-5 flex flex-col gap-3">
          <h3 className="font-bold text-gray-300 text-sm">Inventory Health</h3>
          {items.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-6">Add items to see your health score</p>
          ) : (
            <div className="flex items-center gap-6">
              <div className="relative flex items-center justify-center shrink-0">
                <HealthRing fresh={fresh.length} total={items.length} />
              </div>
              <div className="space-y-2 flex-1">
                {[
                  { label: 'Fresh',    count: fresh.length,    color: '#4ade80' },
                  { label: 'Warning',  count: warning.length,  color: '#fbbf24' },
                  { label: 'Critical', count: critical.length, color: '#fb923c' },
                  { label: 'Expired',  count: expired.length,  color: '#f87171' },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color, boxShadow: `0 0 6px ${row.color}80` }} />
                    <span className="text-xs text-gray-500 flex-1">{row.label}</span>
                    <span className="text-xs font-bold text-gray-300">{row.count}</span>
                    {items.length > 0 && (
                      <div className="w-16 h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.round((row.count / items.length) * 100)}%`, backgroundColor: row.color }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {ACTIONS.map(({ to, label, icon: Icon, grad, sub }, i) => (
            <Link
              key={i}
              to={to}
              className={`relative rounded-2xl p-4 text-white overflow-hidden bg-gradient-to-br ${grad} flex flex-col gap-1 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 active:scale-95 anim-start animate-scale-in ripple-btn`}
              style={{
                animationDelay: `${300 + i * 70}ms`,
                animationFillMode: 'forwards',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/15 rounded-full animate-drift-y" style={{ animationDelay: `${i * 0.8}s` }} />
              <div className="absolute top-2 right-2 w-1 h-1 bg-white/50 rounded-full animate-twinkle" />
              <Icon size={22} className="opacity-90 relative z-10" />
              <p className="text-sm font-bold relative z-10">{label}</p>
              <p className="text-[10px] opacity-75 relative z-10">{sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── CARBON FOOTPRINT MINI WIDGET ── */}
      {(() => {
        const cf = analyticsData?.carbonFootprint;
        const co2 = cf?.co2Saved ?? 0;
        const donated = cf?.donatedItems ?? 0;
        const km = cf?.carKmAvoided ?? 0;
        const meals = cf?.mealsEquivalent ?? 0;
        return (
          <div
            className="rounded-3xl border border-emerald-500/20 p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #051a12 0%, #07150e 50%, #091a30 100%)',
              boxShadow: '0 0 30px rgba(16,185,129,0.07)',
            }}
          >
            {/* bg glow */}
            <div className="absolute top-[-30px] right-[-20px] w-48 h-48 rounded-full pointer-events-none animate-orb-pulse"
              style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)' }} />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <FiActivity size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-gray-100 text-sm">Carbon Footprint</h3>
                  <p className="text-[10px] text-gray-500">Your environmental impact</p>
                </div>
              </div>
              <Link
                to="/analytics"
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl transition-all border border-emerald-500/20"
              >
                <FiBarChart2 size={12} /> Full Report
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
              {[
                { icon: '🌱', label: 'CO₂ Saved', value: `${co2} kg`,   color: '#10b981' },
                { icon: '🤝', label: 'Donated',   value: `${donated} items`, color: '#06b6d4' },
                { icon: '🚗', label: 'Km Avoided', value: `${km} km`,   color: '#8b5cf6' },
                { icon: '🍽️', label: 'Meals',     value: `${meals}`,    color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i}
                  className="bg-white/5 border border-white/8 rounded-2xl p-3 text-center hover:bg-white/8 transition-colors">
                  <span className="text-2xl">{s.icon}</span>
                  <p className="font-black text-sm mt-1.5" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {co2 > 0 && (
              <div className="mt-4 relative z-10">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-emerald-400 font-bold">Impact Progress → 50 kg CO₂ goal</span>
                  <span className="text-[10px] text-gray-600">{Math.min(Math.round((co2 / 50) * 100), 100)}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((co2 / 50) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, #6366f1, #22c55e, #10b981)',
                      boxShadow: '0 0 8px rgba(16,185,129,0.6)',
                      transition: 'width 1.2s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {co2 === 0 && (
              <p className="text-xs text-gray-600 text-center mt-3 relative z-10">
                Donate items to start tracking your CO₂ impact →{' '}
                <Link to="/donate" className="text-emerald-400 hover:underline">Donate now</Link>
              </p>
            )}
          </div>
        );
      })()}

      {/* ── UPCOMING TIMELINE ── */}
      {items.length > 0 && <UpcomingTimeline items={items} />}

      {/* ── FOOD TIP + WASTE FACT ── */}
      <div className="grid md:grid-cols-2 gap-4">
        <TipCard />

        {/* Food Waste Fact */}
        <div className="bg-gradient-to-br from-rose-900/30 to-orange-900/20 border border-rose-500/20 rounded-2xl p-4 flex flex-col justify-between"
          style={{ boxShadow: '0 0 30px rgba(239,68,68,0.07)' }}>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-3 animate-neon-glow">🌍 Did you know?</span>
          <div className="space-y-3">
            {[
              { icon: '🗑️', value: '1.3 Billion', desc: 'tonnes of food wasted globally per year' },
              { icon: '💸', value: '$1 Trillion',  desc: 'economic cost of food waste annually' },
              { icon: '🏠', value: '30%',          desc: 'of household food is never eaten' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 anim-start animate-slide-left"
                style={{ animationDelay: `${400 + i * 80}ms`, animationFillMode: 'forwards' }}>
                <span className="text-3xl">{f.icon}</span>
                <div>
                  <p className="text-2xl font-black text-gray-100">{f.value}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-rose-800 mt-3 font-medium">Source: FAO, World Resources Institute</p>
        </div>
      </div>

      {/* ── SCROLL LANES ── */}
      {items.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-100 text-lg">By Urgency</h2>
            <Link to="/inventory" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 neon-link">
              Full inventory <FiChevronRight size={13} />
            </Link>
          </div>
          <ScrollLane title="Critical (1–3 days)" items={critical} borderHex="#f97316" emptyMsg="✅ Nothing critical" />
          <ScrollLane title="Warning (4–7 days)"  items={warning}  borderHex="#f59e0b" emptyMsg="✅ Nothing expiring this week" />
          <ScrollLane title="Expired"             items={expired}  borderHex="#ef4444" emptyMsg="✅ No expired items" />
          <ScrollLane title="Fresh (>7 days)"     items={fresh}    borderHex="#22c55e" emptyMsg="Add items to see them here" />
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {items.length === 0 && (
        <div className="text-center py-12 animate-scale-in bg-[#131330] rounded-3xl border border-[#252550]"
          style={{ boxShadow: '0 0 40px rgba(99,102,241,0.05)' }}>
          <div className="text-7xl mb-4 animate-float inline-block">🧺</div>
          <p className="text-xl font-black text-gray-200 mb-2">Your inventory is empty</p>
          <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
            Track household items to get expiry alerts and reduce food waste.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/add-item" className="_btn-indigo inline-flex items-center gap-2 text-sm px-6 py-3">
              <FiPlus size={15} /> Add your first item
            </Link>
            <Link to="/donate" className="inline-flex items-center gap-2 text-sm px-6 py-3 rounded-xl border border-[#252550] text-gray-400 hover:bg-white/5 transition-colors">
              <FiGift size={15} /> Browse donations
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

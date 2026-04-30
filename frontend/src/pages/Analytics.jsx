import { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchAnalytics } from '../store/analytics';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  FiActivity, FiTrendingUp, FiPieChart, FiBarChart2,
  FiZap, FiDroplet, FiWind, FiSun,
} from 'react-icons/fi';

/* ── palette matching the dark theme ── */
const C = {
  fresh:    '#22c55e',
  warning:  '#f59e0b',
  critical: '#f97316',
  expired:  '#ef4444',
  indigo:   '#6366f1',
  violet:   '#8b5cf6',
  cyan:     '#06b6d4',
  rose:     '#f43f5e',
  emerald:  '#10b981',
};

const CAT_COLORS = ['#6366f1','#8b5cf6','#06b6d4','#22c55e','#f59e0b','#f97316','#ef4444','#f43f5e','#10b981'];

const CAT_EMOJI = {
  dairy:'🥛', produce:'🥦', meat:'🥩', snacks:'🍪',
  beverages:'🧃', grains:'🌾', frozen:'🧊', medicine:'💊', other:'📦',
};

/* ── animated counter ── */
function AnimCount({ target, decimals = 0, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let cur = 0;
    const duration = 1200;
    const steps = 60;
    const increment = target / steps;
    const t = setInterval(() => {
      cur = Math.min(cur + increment, target);
      setVal(cur);
      if (cur >= target) clearInterval(t);
    }, duration / steps);
    return () => clearInterval(t);
  }, [target]);
  return <>{decimals > 0 ? val.toFixed(decimals) : Math.round(val)}{suffix}</>;
}

/* ── custom tooltip ── */
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0d28]/95 backdrop-blur-xl border border-indigo-500/30 rounded-xl px-4 py-3 shadow-2xl shadow-black/60">
      <p className="text-xs font-bold text-indigo-300 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-400 capitalize">{p.name}:</span>
          <span className="font-bold text-gray-200">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── pie custom label ── */
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: '11px', fontWeight: 700, pointerEvents: 'none' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

/* ── CO2 Gauge arc ── */
function Co2Gauge({ co2Saved, maxCo2 = 50 }) {
  const pct = Math.min(co2Saved / maxCo2, 1);
  const r = 70;
  const startAngle = Math.PI * 0.8;
  const endAngle   = Math.PI * 2.2;
  const sweep = endAngle - startAngle;

  const toXY = (angle) => ({
    x: 110 + r * Math.cos(angle),
    y: 100 + r * Math.sin(angle),
  });

  const bgStart = toXY(startAngle);
  const bgEnd   = toXY(endAngle);
  const fillEnd = toXY(startAngle + sweep * pct);
  const largeArcBg   = 1;
  const largeArcFill = sweep * pct > Math.PI ? 1 : 0;

  const color = co2Saved === 0 ? '#374151' : co2Saved < 5 ? '#f59e0b' : co2Saved < 20 ? '#22c55e' : '#10b981';

  return (
    <svg width="220" height="140" viewBox="0 0 220 140">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* bg arc */}
      <path
        d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArcBg} 1 ${bgEnd.x} ${bgEnd.y}`}
        fill="none" stroke="#1e1e42" strokeWidth="12" strokeLinecap="round"
      />
      {/* fill arc */}
      {pct > 0 && (
        <path
          d={`M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArcFill} 1 ${fillEnd.x} ${fillEnd.y}`}
          fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round"
          filter="url(#glow)"
          style={{ transition: 'all 1.4s cubic-bezier(0.4,0,0.2,1)' }}
        />
      )}
      {/* needle dot */}
      {pct > 0 && (
        <circle cx={fillEnd.x} cy={fillEnd.y} r="6" fill={color} filter="url(#glow)" />
      )}
      {/* center text */}
      <text x="110" y="92" textAnchor="middle" fill="white" style={{ fontSize: '26px', fontWeight: 900 }}>
        {co2Saved.toFixed(1)}
      </text>
      <text x="110" y="110" textAnchor="middle" fill="#6b7280" style={{ fontSize: '11px' }}>
        kg CO₂ saved
      </text>
    </svg>
  );
}

/* ── section header ── */
function SectionHeader({ icon: Icon, title, sub, color = 'text-indigo-400' }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20`}>
        <Icon size={17} className={color} />
      </div>
      <div>
        <h2 className="font-black text-gray-100 text-base leading-tight">{title}</h2>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── main ── */
export default function Analytics() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(s => s.analytics);

  useEffect(() => { dispatch(fetchAnalytics()); }, [dispatch]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
        <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      <p className="text-sm text-gray-500 animate-pulse">Crunching your impact data…</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <span className="text-4xl">⚠️</span>
      <p className="text-sm text-red-400">Could not load analytics. Make sure you're logged in.</p>
    </div>
  );

  const cf = data?.carbonFootprint ?? { donatedItems: 0, donatedKg: 0, co2Saved: 0, carKmAvoided: 0, treesEquivalent: 0, mealsEquivalent: 0 };
  const sb = data?.statusBreakdown ?? { fresh: 0, warning: 0, critical: 0, expired: 0 };
  const catData = data?.categoryBreakdown ?? [];
  const trend   = data?.weeklyTrend ?? [];

  const statusPie = [
    { name: 'Fresh',    value: sb.fresh,    color: C.fresh },
    { name: 'Warning',  value: sb.warning,  color: C.warning },
    { name: 'Critical', value: sb.critical, color: C.critical },
    { name: 'Expired',  value: sb.expired,  color: C.expired },
  ].filter(d => d.value > 0);

  const totalItems = (data?.totalItems ?? 0);
  const wasteRate = totalItems > 0 ? Math.round((sb.expired / totalItems) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* ── PAGE HERO ── */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #051a0a 0%, #0a1a2e 40%, #0e1040 80%, #1a0533 100%)',
          minHeight: '160px',
        }}
      >
        {/* bg blobs */}
        <div className="absolute top-[-40px] right-[-30px] w-64 h-64 rounded-full pointer-events-none animate-orb-pulse"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-30px] left-[-20px] w-48 h-48 rounded-full pointer-events-none animate-orb-pulse"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', animationDelay: '1.5s' }} />

        <div className="relative z-10 px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <FiActivity size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Impact Analytics</h1>
              <p className="text-emerald-300/80 text-sm">Your environmental footprint &amp; waste patterns</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            {[
              { label: 'Total Items', value: totalItems, icon: '📦' },
              { label: 'Donated', value: cf.donatedItems, icon: '🤝' },
              { label: 'Expired', value: sb.expired, icon: '⚠️' },
              { label: 'CO₂ Saved', value: `${cf.co2Saved} kg`, icon: '🌱' },
            ].map((s, i) => (
              <div key={i}
                className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-2.5">
                <span className="text-lg">{s.icon}</span>
                <div>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="font-black text-white text-sm">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CARBON FOOTPRINT TRACKER ── */}
      <div
        className="rounded-3xl border border-emerald-500/20 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #051a12 0%, #0a1f1a 50%, #091a30 100%)',
          boxShadow: '0 0 40px rgba(16,185,129,0.08), 0 4px 32px rgba(0,0,0,0.5)',
        }}
      >
        <SectionHeader
          icon={FiActivity}
          title="Carbon Footprint Tracker"
          sub="Your personal environmental impact from food waste prevention"
          color="text-emerald-400"
        />

        <div className="grid md:grid-cols-2 gap-6 items-center px-6 pb-6">
          {/* CO2 Gauge */}
          <div className="flex flex-col items-center gap-2">
            <Co2Gauge co2Saved={cf.co2Saved} />
            <p className="text-xs text-gray-500 text-center max-w-xs">
              Based on {cf.donatedKg} kg of food donated · EPA: 2.5 kg CO₂ per kg food waste prevented
            </p>
          </div>

          {/* Impact cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: FiDroplet, label: 'Food Donated',
                value: cf.donatedKg, suffix: ' kg',
                sub: `${cf.donatedItems} item${cf.donatedItems !== 1 ? 's' : ''}`,
                grad: 'from-cyan-500/20 to-blue-600/10', border: 'border-cyan-500/20', color: '#06b6d4',
              },
              {
                icon: FiActivity, label: 'CO₂ Prevented',
                value: cf.co2Saved, suffix: ' kg',
                sub: 'from going to landfill',
                grad: 'from-emerald-500/20 to-green-600/10', border: 'border-emerald-500/20', color: '#10b981',
              },
              {
                icon: FiWind, label: 'Car Km Avoided',
                value: cf.carKmAvoided, suffix: ' km',
                sub: 'driving equivalent saved',
                grad: 'from-violet-500/20 to-indigo-600/10', border: 'border-violet-500/20', color: '#8b5cf6',
              },
              {
                icon: FiSun, label: 'Meals Enabled',
                value: cf.mealsEquivalent, suffix: '',
                sub: 'meals from donations',
                grad: 'from-amber-500/20 to-orange-600/10', border: 'border-amber-500/20', color: '#f59e0b',
              },
            ].map(({ icon: Icon, label, value, suffix, sub, grad, border, color }, i) => (
              <div
                key={i}
                className={`relative rounded-2xl p-4 bg-gradient-to-br ${grad} border ${border} overflow-hidden hover:-translate-y-1 transition-all duration-200`}
                style={{ boxShadow: `0 0 20px ${color}15` }}
              >
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20"
                  style={{ background: `radial-gradient(circle, ${color}, transparent)` }} />
                <Icon size={16} style={{ color }} className="mb-2 relative z-10" />
                <p className="text-2xl font-black text-white relative z-10">
                  <AnimCount target={value} decimals={suffix === ' kg' ? 1 : 0} suffix={suffix} />
                </p>
                <p className="text-xs font-bold text-gray-300 relative z-10">{label}</p>
                <p className="text-[10px] text-gray-500 relative z-10">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CO2 bar */}
        {cf.co2Saved > 0 && (
          <div className="px-6 pb-6">
            <div className="bg-[#0a1a14] rounded-2xl p-4 border border-emerald-500/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-emerald-400">🌱 Impact Progress</span>
                <span className="text-xs text-gray-500">Goal: 50 kg CO₂</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1500"
                  style={{
                    width: `${Math.min((cf.co2Saved / 50) * 100, 100)}%`,
                    background: 'linear-gradient(90deg, #6366f1, #22c55e, #10b981)',
                    boxShadow: '0 0 10px rgba(16,185,129,0.5)',
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5">
                {cf.co2Saved >= 50
                  ? "🎉 Goal achieved! You're a food waste champion."
                  : `${(50 - cf.co2Saved).toFixed(1)} kg CO₂ more to reach your goal`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── ROW: STATUS DONUT + CATEGORY BAR ── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Status Donut */}
        <div
          className="rounded-3xl border border-indigo-500/15 p-5"
          style={{
            background: 'linear-gradient(135deg, #0d0d28 0%, #110d2e 100%)',
            boxShadow: '0 4px 32px rgba(99,102,241,0.08)',
          }}
        >
          <SectionHeader icon={FiPieChart} title="Inventory Status" sub="Current breakdown of your items" />

          {statusPie.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <span className="text-4xl">🧺</span>
              <p className="text-sm text-gray-500">Add items to see your status breakdown</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusPie}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={PieLabel}
                    strokeWidth={0}
                  >
                    {statusPie.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color}
                        style={{ filter: `drop-shadow(0 0 8px ${entry.color}60)` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {statusPie.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/4 rounded-xl px-3 py-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}80` }} />
                    <span className="text-xs text-gray-400 flex-1">{s.name}</span>
                    <span className="text-xs font-black text-gray-200">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Category Bar */}
        <div
          className="rounded-3xl border border-violet-500/15 p-5"
          style={{
            background: 'linear-gradient(135deg, #100d28 0%, #0d1130 100%)',
            boxShadow: '0 4px 32px rgba(139,92,246,0.08)',
          }}
        >
          <SectionHeader icon={FiBarChart2} title="Items by Category" sub="Distribution across food categories" color="text-violet-400" />

          {catData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <span className="text-4xl">📊</span>
              <p className="text-sm text-gray-500">No data yet</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={catData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e42" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={c => (CAT_EMOJI[c] || '📦') + ' ' + c.charAt(0).toUpperCase() + c.slice(1, 4)}
                  />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(139,92,246,0.08)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {catData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CAT_COLORS[i % CAT_COLORS.length]}
                        style={{ filter: `drop-shadow(0 0 6px ${CAT_COLORS[i % CAT_COLORS.length]}50)` }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {catData.slice(0, 5).map((d, i) => (
                  <span key={i} className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                    style={{ background: `${CAT_COLORS[i % CAT_COLORS.length]}20`, color: CAT_COLORS[i % CAT_COLORS.length], border: `1px solid ${CAT_COLORS[i % CAT_COLORS.length]}30` }}>
                    {CAT_EMOJI[d.category] || '📦'} {d.category} · {d.count}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── WEEKLY TREND AREA CHART ── */}
      <div
        className="rounded-3xl border border-cyan-500/15 p-5"
        style={{
          background: 'linear-gradient(135deg, #060d1a 0%, #0a1220 100%)',
          boxShadow: '0 4px 32px rgba(6,182,212,0.07)',
        }}
      >
        <SectionHeader
          icon={FiTrendingUp}
          title="Weekly Trend"
          sub="Items added, donated & expired over the last 8 weeks"
          color="text-cyan-400"
        />

        {trend.every(w => w.added === 0 && w.donated === 0) ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <span className="text-4xl">📈</span>
            <p className="text-sm text-gray-500">Add items to see weekly trends</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAdded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.indigo} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={C.indigo} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDonated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.emerald} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={C.emerald} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpired" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.rose} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C.rose} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3a" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '12px' }}
                  formatter={(v) => <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 600 }}>{v}</span>}
                />
                <Area type="monotone" dataKey="added"   name="Added"
                  stroke={C.indigo}  strokeWidth={2.5} fill="url(#gradAdded)"
                  dot={{ fill: C.indigo, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: C.indigo, strokeWidth: 0, filter: `drop-shadow(0 0 6px ${C.indigo})` }}
                />
                <Area type="monotone" dataKey="donated" name="Donated"
                  stroke={C.emerald} strokeWidth={2.5} fill="url(#gradDonated)"
                  dot={{ fill: C.emerald, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: C.emerald, strokeWidth: 0, filter: `drop-shadow(0 0 6px ${C.emerald})` }}
                />
                <Area type="monotone" dataKey="expired" name="Expired"
                  stroke={C.rose}    strokeWidth={2} fill="url(#gradExpired)"
                  dot={{ fill: C.rose, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: C.rose, strokeWidth: 0 }}
                  strokeDasharray="5 3"
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'Total Added', value: trend.reduce((s, w) => s + w.added, 0), color: C.indigo, icon: '📥' },
                { label: 'Total Donated', value: trend.reduce((s, w) => s + w.donated, 0), color: C.emerald, icon: '🤝' },
                { label: 'Total Expired', value: trend.reduce((s, w) => s + w.expired, 0), color: C.rose, icon: '⚠️' },
              ].map((s, i) => (
                <div key={i} className="bg-white/4 rounded-2xl p-3 text-center border border-white/5">
                  <span className="text-xl">{s.icon}</span>
                  <p className="text-xl font-black mt-1" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── WASTE RATE INSIGHT ── */}
      <div
        className="rounded-3xl border border-rose-500/15 p-5"
        style={{
          background: 'linear-gradient(135deg, #1a0808 0%, #1a0d0d 100%)',
          boxShadow: '0 4px 32px rgba(244,63,94,0.07)',
        }}
      >
        <SectionHeader icon={FiZap} title="Waste Reduction Insight" sub="How well are you managing your food?" color="text-rose-400" />

        <div className="grid sm:grid-cols-3 gap-4">
          {/* Waste rate meter */}
          <div className="sm:col-span-1 flex flex-col items-center justify-center gap-3">
            <div className="relative w-32 h-32">
              <svg width="128" height="128" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="50" fill="none" stroke="#1e1e42" strokeWidth="10" />
                <circle cx="64" cy="64" r="50" fill="none"
                  stroke={wasteRate <= 20 ? C.fresh : wasteRate <= 40 ? C.warning : C.expired}
                  strokeWidth="10"
                  strokeDasharray={`${(wasteRate / 100) * 314} 314`}
                  strokeLinecap="round"
                  strokeDashoffset="78.5"
                  style={{ transition: 'stroke-dasharray 1.4s ease', filter: `drop-shadow(0 0 8px ${wasteRate <= 20 ? C.fresh : C.expired}60)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{wasteRate}%</span>
                <span className="text-[10px] text-gray-500">waste rate</span>
              </div>
            </div>
            <p className="text-xs font-bold text-center"
              style={{ color: wasteRate <= 20 ? C.fresh : wasteRate <= 40 ? C.warning : C.expired }}>
              {wasteRate === 0 ? '🌟 Zero waste!' : wasteRate <= 20 ? '✅ Excellent' : wasteRate <= 40 ? '⚠️ Needs attention' : '❌ High waste'}
            </p>
          </div>

          {/* Insight cards */}
          <div className="sm:col-span-2 grid grid-cols-2 gap-3">
            {[
              {
                label: 'Items Saved', icon: '✅',
                value: sb.fresh + sb.warning + sb.critical,
                sub: 'still in your fridge',
                color: C.fresh,
              },
              {
                label: 'Waste Prevented', icon: '🌱',
                value: cf.donatedItems,
                sub: 'donated instead of trashed',
                color: C.emerald,
              },
              {
                label: 'Expired Items', icon: '🗑️',
                value: sb.expired,
                sub: 'went to waste',
                color: C.expired,
              },
              {
                label: 'Your CO₂ Score', icon: '🏆',
                value: `${cf.co2Saved}kg`,
                sub: 'CO₂ equivalent saved',
                color: C.indigo,
              },
            ].map((s, i) => (
              <div key={i}
                className="bg-white/4 border border-white/5 rounded-2xl p-3 hover:bg-white/6 transition-colors">
                <span className="text-xl">{s.icon}</span>
                <p className="text-xl font-black mt-1" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-bold text-gray-300">{s.label}</p>
                <p className="text-[10px] text-gray-500">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

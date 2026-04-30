import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchDonations, claimDonation } from '../store/donations';
import { getDaysUntilExpiry, getExpiryStatus, getExpiryHex } from '../utils/helper';
import ExpiryBadge from '../components/ExpiryBadge';
import NgoFinder from '../components/NgoFinder';
import {
  FiGift, FiMapPin, FiSearch, FiX, FiHeart, FiPackage,
  FiRefreshCw, FiUsers, FiNavigation
} from 'react-icons/fi';

const CATEGORY_ICONS = {
  dairy: '🥛', produce: '🥦', meat: '🥩', snacks: '🍪',
  beverages: '🧃', grains: '🌾', frozen: '🧊', medicine: '💊', other: '📦',
};

const TABS = [
  { id: 'board',  label: 'Community Board', icon: '🤝' },
  { id: 'ngos',   label: 'Find NGOs Near Me', icon: '📍' },
];

/* ── floating particle ── */
function Particle({ style }) {
  return (
    <div
      className="absolute rounded-full opacity-20 animate-float pointer-events-none"
      style={style}
    />
  );
}

/* ── claim confirm modal ── */
function ClaimModal({ donation, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#131330] border border-[#252550] rounded-2xl shadow-2xl w-full max-w-sm animate-bounce-in" style={{ boxShadow: '0 0 60px rgba(0,0,0,0.9)' }}>
        <div className="p-6 text-center">
          <div className="text-5xl mb-3 animate-bounce">🤝</div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Claim this item?</h3>
          <p className="text-sm text-gray-400 mb-1">
            <span className="font-semibold text-gray-200">{donation.itemName}</span>
          </p>
          <p className="text-xs text-gray-600 mb-6">
            Donated by <span className="font-medium">@{donation.donorName}</span>
            {donation.location && <> · 📍 {donation.location}</>}
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 _btn-ghost border border-gray-200 text-sm py-2.5">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 _btn-indigo text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                : <FiHeart size={13} />}
              {loading ? 'Claiming…' : 'Claim It!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Individual donation card ── */
function DonationCard({ donation, index, onClaim, claimed }) {
  const days = getDaysUntilExpiry(donation.expiryDate);
  const status = getExpiryStatus(days);
  const hex = getExpiryHex(status);
  const icon = CATEGORY_ICONS[donation.category?.toLowerCase()] || '📦';
  const isUrgent = status === 'critical';

  return (
    <div
      className="donate-card anim-start animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 60, 400)}ms`, animationFillMode: 'forwards' }}
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full rounded-t-2xl" style={{ backgroundColor: hex }} />

      <div className="p-4 flex flex-col gap-3">
        {/* Item info */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: `${hex}18` }}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 leading-tight truncate">{donation.itemName}</h3>
            <p className="text-xs text-gray-400 capitalize mt-0.5">{donation.category}</p>
            <p className="text-sm font-medium text-gray-600 mt-1">{donation.quantity} {donation.unit}</p>
          </div>
          {isUrgent && (
            <span className="animate-pulse text-lg shrink-0">🔥</span>
          )}
        </div>

        {/* Badge + donor */}
        <div className="flex items-center justify-between gap-2">
          <ExpiryBadge expiryDate={donation.expiryDate} />
          <span className="text-xs text-gray-400">@{donation.donorName}</span>
        </div>

        {/* Location */}
        {donation.location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-1.5">
            <FiMapPin size={11} className="shrink-0" />
            <span className="truncate">{donation.location}</span>
          </div>
        )}

        {/* CTA */}
        {claimed ? (
          <div className="w-full text-center text-sm font-semibold text-green-600 bg-green-50 border border-green-200 rounded-xl py-2.5 animate-badge-pop">
            ✓ Claimed — enjoy it!
          </div>
        ) : (
          <button
            onClick={() => onClaim(donation)}
            className="_btn-indigo w-full text-sm py-2.5 flex items-center justify-center gap-2 group"
          >
            <FiHeart size={14} className="group-hover:scale-110 transition-transform" />
            Claim Item
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Community board tab content ── */
function CommunityBoard({ donations, loading, search, setSearch, claimedIds, onClaim }) {
  const filtered = donations.filter(d =>
    d.itemName.toLowerCase().includes(search.toLowerCase()) ||
    d.donorName.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  const urgent = filtered.filter(d => {
    const s = getExpiryStatus(getDaysUntilExpiry(d.expiryDate));
    return s === 'critical' || s === 'warning';
  });
  const others = filtered.filter(d => {
    const s = getExpiryStatus(getDaysUntilExpiry(d.expiryDate));
    return s !== 'critical' && s !== 'warning';
  });

  if (!loading && donations.length === 0) {
    return (
      <div className="relative rounded-3xl overflow-hidden py-24 text-center animate-scale-in"
        style={{ background: 'linear-gradient(135deg,#f0f4ff,#fdf4ff)' }}>
        <Particle style={{ width: 80, height: 80, background: '#6366f1', top: '10%', left: '8%', animationDelay: '0s' }} />
        <Particle style={{ width: 50, height: 50, background: '#8b5cf6', bottom: '15%', right: '10%', animationDelay: '1s' }} />
        <Particle style={{ width: 30, height: 30, background: '#06b6d4', top: '60%', left: '20%', animationDelay: '1.5s' }} />
        <div className="text-7xl mb-5 animate-float">🎁</div>
        <h2 className="text-2xl font-black text-gray-700 mb-3">No donations yet</h2>
        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8">
          Be the first to share! Go to your Inventory and donate items nearing their expiry.
        </p>
        <Link to="/inventory"
          className="_btn-indigo inline-flex items-center gap-2 px-6 py-3">
          <FiPackage size={15} /> Go to Inventory
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          className="_input pl-11 text-sm"
          placeholder="Search items, categories, donors…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <FiX size={15} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl skeleton h-52" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 animate-scale-in">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-semibold text-gray-600">No results for &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        <>
          {/* Urgent section */}
          {urgent.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 animate-fade-up">
                <span className="animate-pulse text-orange-500 text-lg">🔥</span>
                <h2 className="font-bold text-orange-600 text-sm uppercase tracking-wide">
                  Grab quickly — expiring soon
                </h2>
                <span className="ml-auto text-xs text-gray-400">{urgent.length} item{urgent.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {urgent.map((d, i) => (
                  <DonationCard key={d._id} donation={d} index={i} onClaim={onClaim} claimed={claimedIds.has(d._id)} />
                ))}
              </div>
            </div>
          )}

          {/* Other donations */}
          {others.length > 0 && (
            <div>
              {urgent.length > 0 && (
                <h2 className="font-bold text-gray-600 text-sm uppercase tracking-wide mb-4 animate-fade-up">
                  All available
                </h2>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {others.map((d, i) => (
                  <DonationCard key={d._id} donation={d} index={i} onClaim={onClaim} claimed={claimedIds.has(d._id)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

/* ── Main Donate page ── */
export default function Donate() {
  const dispatch = useAppDispatch();
  const { donations, loading } = useAppSelector((state) => state.donations);

  const [activeTab, setActiveTab] = useState('board');
  const [search, setSearch] = useState('');
  const [claimTarget, setClaimTarget] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [claimedIds, setClaimedIds] = useState(new Set());
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  useEffect(() => { dispatch(fetchDonations()); }, [dispatch]);

  const handleConfirmClaim = async () => {
    if (!claimTarget) return;
    setClaiming(true);
    const result = await dispatch(claimDonation(claimTarget._id));
    setClaiming(false);
    if (result.meta.requestStatus === 'fulfilled') {
      setClaimedIds(prev => new Set([...prev, claimTarget._id]));
    }
    setClaimTarget(null);
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    setSeedMsg('');
    try {
      const res = await axios.post('http://localhost:4000/seed-demo', {}, { withCredentials: true });
      setSeedMsg(`✓ ${res.data.message}`);
      dispatch(fetchDonations());
    } catch {
      setSeedMsg('⚠️ Could not load demo data — make sure you are logged in.');
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMsg(''), 4000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Hero banner ── */}
      <div
        className="rounded-3xl p-6 mb-8 relative overflow-hidden animate-fade-down"
        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)', backgroundSize: '200% 200%', animation: 'gradientShift 5s ease infinite' }}
      >
        <Particle style={{ width: 100, height: 100, background: '#fff', top: '-20px', right: '-20px', animationDelay: '0s' }} />
        <Particle style={{ width: 60, height: 60, background: '#fff', bottom: '-10px', left: '30%', animationDelay: '1.2s' }} />
        <Particle style={{ width: 40, height: 40, background: '#fff', top: '40%', left: '60%', animationDelay: '2s' }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl animate-float">🤲</span>
            <div>
              <h1 className="text-2xl font-black text-white">Donate &amp; Share</h1>
              <p className="text-purple-100 text-sm">Reduce waste · Feed your community · Find local food banks</p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 text-center border border-white/25">
              <p className="text-white text-lg font-black">{donations.length}</p>
              <p className="text-purple-100 text-[10px] leading-tight">Available</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 text-center border border-white/25">
              <p className="text-white text-lg font-black">{claimedIds.size}</p>
              <p className="text-purple-100 text-[10px] leading-tight">Claimed</p>
            </div>
          </div>
        </div>

        {/* Floating food emojis */}
        {['🥛','🍌','🥦','🧀','🥚','🍎'].map((e, i) => (
          <span key={i} className="absolute pointer-events-none select-none opacity-20 text-2xl animate-float"
            style={{ top: `${15 + (i * 13) % 65}%`, left: `${5 + (i * 15) % 85}%`, animationDelay: `${i * 0.4}s` }}>
            {e}
          </span>
        ))}
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex items-center gap-1 bg-[#0d0d28] border border-[#252550] p-1 rounded-2xl mb-6 animate-fade-up">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-[#1a1a40] text-indigo-300 shadow-lg border border-[#3d3d70]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.id === 'board' && donations.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'board' ? 'bg-indigo-500/25 text-indigo-300' : 'bg-white/5 text-gray-600'
              }`}>
                {donations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Community Board tab ── */}
      {activeTab === 'board' && (
        <div className="animate-fade-up">
          {/* Toolbar: demo seed button */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiUsers size={14} className="text-indigo-400" />
              <span>Items shared by your community</span>
            </div>
            <div className="flex items-center gap-3">
              {seedMsg && (
                <span className="text-xs text-green-400 bg-green-900/30 border border-green-700/40 px-3 py-1.5 rounded-xl animate-fade-down">
                  {seedMsg}
                </span>
              )}
              <button
                onClick={handleSeedDemo}
                disabled={seeding}
                className="flex items-center gap-2 text-xs font-semibold bg-[#131330] border border-[#252550] text-gray-400 hover:border-indigo-500/40 hover:text-indigo-400 px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-60"
              >
                {seeding
                  ? <span className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  : <FiRefreshCw size={12} />}
                {seeding ? 'Loading…' : 'Load Demo Data'}
              </button>
            </div>
          </div>

          <CommunityBoard
            donations={donations}
            loading={loading}
            search={search}
            setSearch={setSearch}
            claimedIds={claimedIds}
            onClaim={setClaimTarget}
          />
        </div>
      )}

      {/* ── NGO Finder tab ── */}
      {activeTab === 'ngos' && (
        <div className="animate-fade-up">
          {/* Intro card */}
          <div className="rounded-2xl p-5 mb-6 border border-green-700/30 bg-green-900/20 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-900/40 flex items-center justify-center text-2xl flex-shrink-0">
              🏢
            </div>
            <div>
              <h3 className="font-bold text-green-300 mb-1">Find food banks &amp; NGOs near you</h3>
              <p className="text-sm text-green-500">
                Can&apos;t find a community match? Donate directly to verified food banks and NGOs.
                Hit <strong>Near Me</strong> to auto-detect your city, or browse by city below.
              </p>
            </div>
            <button
              onClick={() => {
                // Scroll NgoFinder's locate button into focus by triggering the component
                document.getElementById('ngo-locate-btn')?.click();
              }}
              className="shrink-0 flex items-center gap-2 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-all active:scale-95"
            >
              <FiNavigation size={12} /> Locate Me
            </button>
          </div>

          <NgoFinder />
        </div>
      )}

      {/* ── Claim modal ── */}
      {claimTarget && (
        <ClaimModal
          donation={claimTarget}
          onConfirm={handleConfirmClaim}
          onCancel={() => setClaimTarget(null)}
          loading={claiming}
        />
      )}
    </div>
  );
}

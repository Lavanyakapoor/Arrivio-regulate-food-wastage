import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchItems, deleteItem } from '../store/inventory';
import { listForDonation } from '../store/donations';
import { getDaysUntilExpiry, getExpiryStatus } from '../utils/helper';
import ItemCard from '../components/ItemCard';
import { FiPlus, FiSearch, FiX, FiFilter } from 'react-icons/fi';
import { CATEGORIES_LIST } from '../lib/data/commonItems';

const TABS = [
  { key: 'all',      label: 'All',      color: 'indigo' },
  { key: 'critical', label: 'Critical', color: 'orange' },
  { key: 'warning',  label: 'Warning',  color: 'amber'  },
  { key: 'fresh',    label: 'Fresh',    color: 'green'  },
  { key: 'expired',  label: 'Expired',  color: 'red'    },
];

const TAB_ACTIVE = {
  indigo: 'bg-indigo-500 text-white border-indigo-500',
  orange: 'bg-orange-500 text-white border-orange-500',
  amber:  'bg-amber-500  text-white border-amber-500',
  green:  'bg-green-500  text-white border-green-500',
  red:    'bg-red-500    text-white border-red-500',
};

export default function Inventory() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.inventory);

  const [activeTab, setActiveTab]   = useState('all');
  const [category,  setCategory]    = useState('all');
  const [search,    setSearch]      = useState('');
  const [donateModal, setDonateModal] = useState(null);
  const [location, setLocation]     = useState('');
  const [donating, setDonating]     = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { dispatch(fetchItems()); }, [dispatch]);

  const filtered = items.filter(item => {
    const status    = getExpiryStatus(getDaysUntilExpiry(item.expiryDate));
    const matchTab  = activeTab === 'all' || status === activeTab;
    const matchCat  = category === 'all'  || item.category?.toLowerCase() === category;
    const matchSrch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchCat && matchSrch;
  });

  const tabCount = (key) =>
    key === 'all'
      ? items.length
      : items.filter(i => getExpiryStatus(getDaysUntilExpiry(i.expiryDate)) === key).length;

  const handleDelete = (id) => {
    if (window.confirm('Remove this item from your inventory?')) dispatch(deleteItem(id));
  };

  const submitDonation = async () => {
    if (!donateModal) return;
    setDonating(true);
    await dispatch(listForDonation({
      itemId: donateModal._id, itemName: donateModal.name,
      category: donateModal.category, expiryDate: donateModal.expiryDate,
      quantity: donateModal.quantity, unit: donateModal.unit, location,
    }));
    dispatch(fetchItems());
    setDonateModal(null);
    setDonating(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-down">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <Link to="/add-item"
          className="_btn-indigo flex items-center gap-2 text-sm py-2 px-4">
          <FiPlus size={15} /> Add Item
        </Link>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3 mb-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
          <input
            className="_input pl-10"
            placeholder="Search items…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
              <FiX size={15} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
            ${showFilters || category !== 'all'
              ? 'border-indigo-500/50 text-indigo-400 bg-indigo-500/15'
              : 'border-[#252550] text-gray-500 hover:border-[#3d3d70] bg-[#131330]'}`}
        >
          <FiFilter size={14} />
          {category !== 'all'
            ? CATEGORIES_LIST.find(c => c.key === category)?.label
            : 'Filter'}
        </button>
      </div>

      {/* Category filter pills */}
      {showFilters && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4 animate-fade-down">
          {CATEGORIES_LIST.map(cat => (
            <button
              key={cat.key}
              onClick={() => { setCategory(cat.key); setShowFilters(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all
                ${category === cat.key
                  ? 'bg-indigo-500 text-white border-indigo-500'
                  : 'bg-[#131330] text-gray-400 border-[#252550] hover:border-indigo-500/40 hover:text-indigo-400'}`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Expiry tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar animate-fade-up" style={{ animationDelay: '100ms' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap border transition-all duration-200 active:scale-95
              ${activeTab === tab.key
                ? TAB_ACTIVE[tab.color]
                : 'bg-[#131330] text-gray-500 border-[#252550] hover:border-[#3d3d70] hover:text-gray-300'}`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
              ${activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-white/5 text-gray-600'}`}>
              {tabCount(tab.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl skeleton h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 animate-scale-in">
          <div className="text-6xl mb-3">📭</div>
          <p className="font-semibold text-gray-400 mb-1">No items found</p>
          <p className="text-sm text-gray-600">
            {search ? `No results for "${search}"` : 'Try a different filter'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <div
              key={item._id}
              className="anim-start animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 50, 400)}ms`, animationFillMode: 'forwards' }}
            >
              <ItemCard item={item} onDelete={handleDelete} onDonate={setDonateModal} />
            </div>
          ))}
        </div>
      )}

      {/* Donate Modal */}
      {donateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#131330] border border-[#252550] rounded-2xl shadow-2xl w-full max-w-sm animate-bounce-in"
            style={{ boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}>
            <div className="p-5 border-b border-[#252550]">
              <h2 className="text-lg font-bold text-gray-100 mb-1">List for Donation</h2>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-300">{donateModal.name}</span> will appear on the community board
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  Pickup Location <span className="text-gray-700">(optional)</span>
                </label>
                <input
                  className="_input"
                  placeholder="e.g. Downtown community center"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setDonateModal(null)}
                  className="flex-1 _btn-ghost border border-[#252550] text-sm py-2">
                  Cancel
                </button>
                <button onClick={submitDonation} disabled={donating}
                  className="flex-1 _btn-indigo text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-60">
                  {donating
                    ? <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    : '🤝'}
                  {donating ? 'Listing…' : 'Confirm Donation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { addItem } from '../store/inventory';
import commonItems, { CATEGORIES_LIST } from '../lib/data/commonItems';
import { FiArrowLeft, FiSearch, FiPlus, FiCheck, FiX } from 'react-icons/fi';

const UNITS = ['pcs', 'kg', 'g', 'L', 'mL', 'pack', 'box', 'bottle', 'can', 'bag'];
const today = new Date().toISOString().split('T')[0];

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export default function AddItem() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [quickItem, setQuickItem] = useState(null);
  const [form, setForm] = useState({
    name: '', category: 'other', quantity: '', unit: 'pcs',
    purchaseDate: today, expiryDate: '',
  });
  const [addedIds, setAddedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showManual, setShowManual] = useState(false);
  const formRef = useRef(null);

  const filteredItems = commonItems.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openQuickAdd = (item) => {
    setQuickItem({
      ...item,
      quantity: item.defaultQty,
      purchaseDate: today,
      expiryDate: addDays(item.defaultExpiryDays),
    });
  };

  const submitQuickAdd = async () => {
    if (!quickItem) return;
    setLoading(true);
    const result = await dispatch(addItem({
      name: quickItem.name,
      category: quickItem.category,
      quantity: Number(quickItem.quantity),
      unit: quickItem.unit,
      purchaseDate: quickItem.purchaseDate,
      expiryDate: quickItem.expiryDate,
    }));
    setLoading(false);
    if (result.meta.requestStatus === 'fulfilled') {
      setAddedIds(prev => new Set([...prev, quickItem.name]));
      setQuickItem(null);
    } else {
      setError('Failed to add. Are you logged in?');
    }
  };

  const prefillManual = (item) => {
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.defaultQty),
      unit: item.unit,
      purchaseDate: today,
      expiryDate: addDays(item.defaultExpiryDays),
    });
    setShowManual(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Item name is required');
    if (!form.quantity || Number(form.quantity) <= 0) return setError('Enter a valid quantity');
    if (!form.expiryDate) return setError('Expiry date is required');
    setLoading(true);
    const result = await dispatch(addItem({ ...form, quantity: Number(form.quantity) }));
    setLoading(false);
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/inventory');
    } else {
      setError(result.payload || 'Failed to add item');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-down">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/8 text-gray-500 hover:text-gray-200 transition-colors">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Add Items</h1>
          <p className="text-sm text-gray-500">Browse the catalog or add manually</p>
        </div>
      </div>

      {/* Search + Category tabs */}
      <div className="animate-fade-up anim-start" style={{ animationDelay: '60ms', animationFillMode: 'forwards' }}>
        <div className="relative mb-4">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={17} />
          <input
            className="_input pl-11 text-base"
            placeholder="Search items — e.g. milk, bread, chicken..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
              <FiX size={16} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
          {CATEGORIES_LIST.map((cat, i) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border
                ${activeCategory === cat.key
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30 scale-105'
                  : 'bg-[#131330] text-gray-400 border-[#252550] hover:border-indigo-500/40 hover:text-indigo-400'
                }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-600">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-medium">No items found for &ldquo;{search}&rdquo;</p>
          </div>
        ) : (
          filteredItems.map((item, i) => {
            const alreadyAdded = addedIds.has(item.name);
            return (
              <div
                key={item.name}
                className="quick-card p-3 flex flex-col items-center text-center gap-2 anim-start animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 35, 400)}ms`, animationFillMode: 'forwards' }}
              >
                <span className="text-3xl">{item.emoji}</span>
                <p className="text-xs font-semibold text-gray-300 leading-tight">{item.name}</p>
                <p className="text-[10px] text-gray-600 capitalize -mt-1">{item.category}</p>
                <p className="text-[10px] text-indigo-400 font-medium">
                  ~{item.defaultExpiryDays}d shelf life
                </p>
                <div className="flex gap-1 w-full mt-1">
                  <button
                    onClick={() => openQuickAdd(item)}
                    disabled={alreadyAdded}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                      ${alreadyAdded
                        ? 'bg-green-900/40 text-green-400 border border-green-700/40'
                        : 'bg-indigo-500 hover:bg-indigo-400 text-white active:scale-95'}`}
                  >
                    {alreadyAdded ? <><FiCheck size={11} /> Added</> : <><FiPlus size={11} /> Quick Add</>}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual / Custom Add toggle */}
      <div className="border-t border-[#252550] pt-6" ref={formRef}>
        <button
          onClick={() => setShowManual(v => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors mb-4"
        >
          <span className={`transition-transform duration-300 ${showManual ? 'rotate-45' : ''}`}>
            <FiPlus size={16} />
          </span>
          {showManual ? 'Hide' : 'Add a Custom Item manually'}
        </button>

        {showManual && (
          <form
            onSubmit={handleManualSubmit}
            className="bg-[#131330] rounded-2xl border border-[#252550] shadow-xl p-6 space-y-4 animate-fade-up"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Item Name</label>
                <input className="_input" placeholder="e.g. Whole Milk" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Category</label>
                <select className="_input capitalize" value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES_LIST.slice(1).map(c => (
                    <option key={c.key} value={c.key} className="capitalize">{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Quantity</label>
                  <input className="_input" type="number" min="0.1" step="0.1" placeholder="1"
                    value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Unit</label>
                  <select className="_input" value={form.unit}
                    onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Purchase Date</label>
                <input className="_input" type="date" max={today} value={form.purchaseDate}
                  onChange={e => setForm(p => ({ ...p, purchaseDate: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Expiry Date</label>
                <input className="_input" type="date" value={form.expiryDate}
                  onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/25 border border-red-700/40 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="_btn-indigo w-full py-3 text-base disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : <FiPlus size={17} />}
              {loading ? 'Adding…' : 'Add to Inventory'}
            </button>
          </form>
        )}
      </div>

      {/* Quick-Add Modal */}
      {quickItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#131330] border border-[#252550] rounded-2xl shadow-2xl w-full max-w-sm animate-bounce-in"
            style={{ boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}>
            <div className="p-5 border-b border-[#252550] flex items-center gap-3">
              <span className="text-4xl">{quickItem.emoji}</span>
              <div>
                <h3 className="font-bold text-gray-100">{quickItem.name}</h3>
                <p className="text-xs text-gray-500 capitalize">{quickItem.category}</p>
              </div>
              <button onClick={() => setQuickItem(null)}
                className="ml-auto text-gray-600 hover:text-gray-300 p-1 rounded-lg hover:bg-white/8">
                <FiX size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Qty</label>
                  <input
                    className="_input"
                    type="number" min="0.1" step="0.1"
                    value={quickItem.quantity}
                    onChange={e => setQuickItem(p => ({ ...p, quantity: e.target.value }))}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Unit</label>
                  <select className="_input" value={quickItem.unit}
                    onChange={e => setQuickItem(p => ({ ...p, unit: e.target.value }))}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Expiry Date</label>
                <input className="_input" type="date"
                  value={quickItem.expiryDate}
                  onChange={e => setQuickItem(p => ({ ...p, expiryDate: e.target.value }))}
                />
                <p className="text-xs text-indigo-400 mt-1">
                  Default: {quickItem.defaultExpiryDays} days — adjust as needed
                </p>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setQuickItem(null)}
                  className="flex-1 _btn-ghost border border-[#252550] text-sm py-2">
                  Cancel
                </button>
                <button onClick={submitQuickAdd} disabled={loading}
                  className="flex-1 _btn-indigo text-sm py-2 flex items-center justify-center gap-2">
                  {loading
                    ? <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    : <FiCheck size={14} />}
                  {loading ? 'Adding…' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

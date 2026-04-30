import { useState, useEffect } from 'react';
import NGOs, { CITIES } from '../lib/data/ngos';
import { FiMapPin, FiPhone, FiMail, FiExternalLink, FiNavigation, FiSearch, FiX, FiClock } from 'react-icons/fi';

const TYPE_COLOR = {
  'Food Rescue':             'bg-green-100 text-green-700',
  'Food Bank':               'bg-blue-100 text-blue-700',
  'Meal Programme':          'bg-purple-100 text-purple-700',
  'Resource Centre':         'bg-amber-100 text-amber-700',
  'Food Rescue NGO':         'bg-emerald-100 text-emerald-700',
  'Charitable Organisation': 'bg-pink-100 text-pink-700',
  'National Programme':      'bg-indigo-100 text-indigo-700',
  'National Network':        'bg-cyan-100 text-cyan-700',
};

function NgoCard({ ngo, index }) {
  const [expanded, setExpanded] = useState(false);
  const typeClass = TYPE_COLOR[ngo.type] || 'bg-gray-100 text-gray-600';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ngo.mapQuery)}`;

  return (
    <div
      className="_card-base overflow-hidden anim-start animate-fade-up cursor-pointer bg-[#131330]"
      style={{ animationDelay: `${Math.min(index * 60, 500)}ms`, animationFillMode: 'forwards' }}
      onClick={() => setExpanded(v => !v)}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl flex-shrink-0">
            {ngo.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-100 leading-tight text-sm">{ngo.name}</h3>
            <span className={`_pill mt-1 text-[10px] font-semibold border-0 ${typeClass}`}>
              {ngo.type}
            </span>
          </div>
        </div>

        {/* Address + timing */}
        <div className="space-y-1.5 text-xs text-gray-500 mt-1">
          <div className="flex items-start gap-2">
            <FiMapPin size={11} className="text-indigo-400 shrink-0 mt-0.5" />
            <span>{ngo.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock size={11} className="text-indigo-400 shrink-0" />
            <span>{ngo.timings}</span>
          </div>
        </div>

        {/* Accepts badges */}
        <div className="flex flex-wrap gap-1 mt-3">
          {ngo.accepts.slice(0, 3).map((a, i) => (
            <span key={i} className="text-[10px] bg-white/6 text-gray-500 rounded-full px-2 py-0.5">{a}</span>
          ))}
          {ngo.accepts.length > 3 && (
            <span className="text-[10px] bg-white/6 text-gray-600 rounded-full px-2 py-0.5">
              +{ngo.accepts.length - 3} more
            </span>
          )}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-3 border-t border-[#252550] space-y-2 animate-fade-down">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Accepts</p>
            <div className="flex flex-wrap gap-1">
              {ngo.accepts.map((a, i) => (
                <span key={i} className="text-xs bg-green-900/40 text-green-400 border border-green-700/40 rounded-full px-2.5 py-0.5">{a}</span>
              ))}
            </div>

            {ngo.phone && (
              <a href={`tel:${ngo.phone}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-indigo-600 transition-colors mt-2" onClick={e => e.stopPropagation()}>
                <FiPhone size={12} /> {ngo.phone}
              </a>
            )}
            {ngo.email && (
              <a href={`mailto:${ngo.email}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-indigo-600 transition-colors" onClick={e => e.stopPropagation()}>
                <FiMail size={12} /> {ngo.email}
              </a>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl py-2 transition-all active:scale-95"
          >
            <FiNavigation size={11} /> Get Directions
          </a>
          {ngo.website && ngo.website !== '#' && (
            <a
              href={ngo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center text-xs text-gray-500 hover:text-indigo-400 bg-white/6 hover:bg-indigo-500/15 rounded-xl py-2 px-3 transition-all"
            >
              <FiExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NgoFinder() {
  const [selectedCity, setSelectedCity] = useState('');
  const [search, setSearch] = useState('');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');

  const handleLocate = () => {
    setLocating(true);
    setLocError('');
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported by your browser');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Simple lat/lng → city heuristic for Indian metros
        const { latitude: lat, longitude: lng } = pos.coords;
        let city = 'Online / Pan-India';
        if (lat > 18.8 && lat < 19.3 && lng > 72.7 && lng < 73.1)       city = 'Mumbai';
        else if (lat > 28.4 && lat < 28.9 && lng > 76.8 && lng < 77.4)  city = 'Delhi';
        else if (lat > 12.8 && lat < 13.2 && lng > 77.4 && lng < 77.8)  city = 'Bangalore';
        else if (lat > 12.9 && lat < 13.2 && lng > 80.1 && lng < 80.4)  city = 'Chennai';
        else if (lat > 17.3 && lat < 17.6 && lng > 78.3 && lng < 78.6)  city = 'Hyderabad';
        else if (lat > 18.4 && lat < 18.7 && lng > 73.7 && lng < 74.0)  city = 'Pune';
        else if (lat > 22.4 && lat < 22.7 && lng > 88.2 && lng < 88.5)  city = 'Kolkata';
        setSelectedCity(city);
        setLocating(false);
      },
      () => {
        setLocError('Could not detect location — please select your city manually');
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const filtered = NGOs.filter(ngo => {
    const matchCity = !selectedCity || ngo.city === selectedCity || ngo.city.includes('Pan-India');
    const matchSearch = !search ||
      ngo.name.toLowerCase().includes(search.toLowerCase()) ||
      ngo.accepts.some(a => a.toLowerCase().includes(search.toLowerCase())) ||
      ngo.type.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchSearch;
  });

  return (
    <div>
      {/* Section header */}
      <div className="text-center mb-8 animate-fade-up">
        <div className="inline-flex items-center gap-2 bg-green-900/40 text-green-400 border border-green-700/30 rounded-full px-4 py-1.5 text-xs font-semibold mb-3">
          <FiMapPin size={12} /> FIND NEARBY NGOs
        </div>
        <h2 className="text-2xl font-black text-gray-100 mb-2">Donate to a Food Bank Near You</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Can&apos;t find someone in the community? Donate directly to verified NGOs and food banks in your city.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
        {/* City selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCity('')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              !selectedCity ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-[#131330] text-gray-500 border-[#252550] hover:border-indigo-500/40 hover:text-indigo-400'
            }`}
          >
            All Cities
          </button>
          {CITIES.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city === selectedCity ? '' : city)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                selectedCity === city ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Locate row */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            className="_input pl-10 text-sm"
            placeholder="Search by name, type, or accepted items…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={14} />
            </button>
          )}
        </div>
        <button
          id="ngo-locate-btn"
          onClick={handleLocate}
          disabled={locating}
          className="flex items-center gap-2 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-all active:scale-95 shrink-0 disabled:opacity-60"
        >
          {locating
            ? <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <FiNavigation size={13} />}
          {locating ? 'Locating…' : 'Near Me'}
        </button>
      </div>

      {locError && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-4 animate-fade-down">
          ⚠️ {locError}
        </p>
      )}

      {/* Result count */}
      {(selectedCity || search) && (
        <p className="text-xs text-gray-400 mb-4">
          Showing <span className="font-semibold text-gray-600">{filtered.length}</span> NGO{filtered.length !== 1 ? 's' : ''}
          {selectedCity ? ` in ${selectedCity}` : ''}
          {search ? ` matching "${search}"` : ''}
        </p>
      )}

      {/* NGO Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 animate-scale-in">
          <div className="text-5xl mb-3">🏢</div>
          <p className="font-semibold">No NGOs found</p>
          <p className="text-sm mt-1">Try a different city or clear your search</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ngo, i) => <NgoCard key={ngo.id} ngo={ngo} index={i} />)}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center mt-8 max-w-lg mx-auto">
        NGO information is provided for reference. Please contact them directly to confirm pickup schedules and accepted items.
        "Get Directions" opens Google Maps.
      </p>
    </div>
  );
}

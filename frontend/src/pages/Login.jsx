import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const FOOD_EMOJIS = ['🥛','🥦','🍎','🧀','🍌','🥕','🍅','🥚','🍇','🫐','🧈','🥝','🍊','🌽','🥑'];

const FEATURES = [
  { icon: '📊', title: 'Track Expiry Dates', desc: 'Never let food go to waste again' },
  { icon: '🔔', title: 'Smart Alerts', desc: 'Get notified before items expire' },
  { icon: '🤝', title: 'Community Donations', desc: 'Share near-expiry food with neighbours' },
  { icon: '🌍', title: 'Reduce Waste', desc: 'Join thousands fighting food waste' },
];

const STATS = [
  { value: '1.3B', label: 'Tonnes wasted yearly' },
  { value: '30%', label: 'Food never eaten' },
  { value: '10x', label: 'Less waste with tracking' },
];

function FloatingEmoji({ emoji, style }) {
  return (
    <div
      className="absolute text-2xl select-none pointer-events-none opacity-60"
      style={{ animation: `float ${3 + Math.random() * 3}s ease-in-out infinite`, ...style }}
    >
      {emoji}
    </div>
  );
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      triggerShake();
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:4000/login', { username, password }, { withCredentials: true });
      localStorage.setItem('login', res.data.username || username);
      setSuccess(true);
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach server — make sure the backend is running on port 4000');
      } else {
        setError(err.response.data || 'Invalid username or password');
      }
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  // Precompute random positions once
  const particles = FOOD_EMOJIS.map((emoji, i) => ({
    emoji,
    style: {
      top: `${8 + (i * 17) % 85}%`,
      left: `${5 + (i * 19) % 88}%`,
      animationDelay: `${(i * 0.4) % 3}s`,
      fontSize: i % 3 === 0 ? '2rem' : i % 3 === 1 ? '1.5rem' : '1rem',
      opacity: 0.15 + (i % 5) * 0.08,
    },
  }));

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div
        className="hidden md:flex md:w-1/2 lg:w-[55%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#4f46e5 0%,#7c3aed 50%,#2563eb 100%)' }}
      >
        {/* Animated background circles */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 bg-white/10 rounded-full animate-float" />
        <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full animate-spin-slow" />

        {/* Floating food particles */}
        {particles.map((p, i) => <FloatingEmoji key={i} emoji={p.emoji} style={p.style} />)}

        {/* Top: Brand */}
        <div className="relative z-10 animate-fade-down">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-black">A</span>
            </div>
            <span className="text-white text-2xl font-black">Arrivio</span>
          </div>
          <p className="text-indigo-200 text-sm">Your household's smart inventory tracker</p>
        </div>

        {/* Middle: Stats + Features */}
        <div className="relative z-10 space-y-6 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mb-2">
            {STATS.map((s, i) => (
              <div key={i} className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/20">
                <p className="text-white text-xl font-black">{s.value}</p>
                <p className="text-indigo-200 text-[10px] leading-tight mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Feature bullets */}
          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/15 anim-start animate-slide-left"
                style={{ animationDelay: `${300 + i * 80}ms`, animationFillMode: 'forwards' }}
              >
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">{f.title}</p>
                  <p className="text-indigo-200 text-xs">{f.desc}</p>
                </div>
                <FiCheckCircle className="ml-auto text-green-300 shrink-0" size={16} />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 animate-fade-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
          <p className="text-white/90 text-sm italic leading-relaxed">
            "Arrivio helped me cut my household food waste by 60%. I save money and feel good about sharing extras with my community."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-xs font-bold text-white">S</div>
            <p className="text-indigo-200 text-xs font-medium">Sarah K. · Home Cook</p>
            <div className="ml-auto flex gap-0.5">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-300 text-xs">★</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f8fafc]">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-black">A</span>
            </div>
            <span className="text-xl font-black text-indigo-500">
              Arrivio
            </span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-black text-gray-800">Welcome back! 👋</h1>
              <p className="text-gray-400 text-sm mt-1">Sign in to manage your inventory</p>
            </div>

            {/* Success state */}
            {success && (
              <div className="flex flex-col items-center py-8 animate-bounce-in">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <FiCheckCircle size={36} className="text-green-500" />
                </div>
                <p className="font-bold text-gray-700">Login successful!</p>
                <p className="text-sm text-gray-400 mt-1">Redirecting to your dashboard…</p>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className={`space-y-4 ${shake ? 'animate-[shake_0.5s_ease]' : ''}`}>

                {/* Error banner */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 animate-fade-down">
                    <span className="text-base">⚠️</span> {error}
                  </div>
                )}

                {/* Username */}
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="_input pl-11 py-3.5 text-gray-800 placeholder-gray-400"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="_input pl-11 pr-11 py-3.5 text-gray-800 placeholder-gray-400"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Sign In <FiArrowRight size={16} /></>
                  )}
                </button>

                {/* Links */}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-sm text-gray-500">
                    No account?{' '}
                    <Link to="/signup" className="text-indigo-500 font-semibold hover:text-indigo-700 transition-colors">
                      Sign up free
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Demo hint */}
          <p className="text-center text-xs text-gray-400 mt-4">
            New here? <Link to="/signup" className="text-indigo-400 hover:underline">Create an account</Link> — it&apos;s free
          </p>
        </div>
      </div>
    </div>
  );
}

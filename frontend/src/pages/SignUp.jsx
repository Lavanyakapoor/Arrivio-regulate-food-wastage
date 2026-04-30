import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle, FiCheck, FiX } from 'react-icons/fi';

const BENEFITS = [
  { icon: '📦', text: 'Track all household items in one place' },
  { icon: '⏰', text: 'Expiry alerts before things go bad' },
  { icon: '🤝', text: 'Donate extras to your community' },
  { icon: '📍', text: 'Find nearby NGOs to donate food' },
  { icon: '📊', text: 'See your waste-reduction stats' },
  { icon: '🌱', text: 'Make a real environmental impact' },
];

const FOOD_EMOJIS = ['🍕','🥗','🍱','🧆','🥘','🫕','🍲','🥙','🌮','🥞','🍣','🥟','🍜','🥗','🫙'];

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 6 characters', ok: password.length >= 6 },
    { label: 'Contains a number',     ok: /\d/.test(password) },
    { label: 'Contains a letter',     ok: /[a-zA-Z]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const bar = ['bg-red-400', 'bg-amber-400', 'bg-green-400'][score - 1] || 'bg-gray-200';
  const label = ['', 'Weak', 'Fair', 'Strong'][score] || '';

  if (!password) return null;
  return (
    <div className="mt-2 space-y-2 animate-fade-down">
      <div className="flex gap-1 items-center">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? bar : 'bg-gray-200'}`} />
        ))}
        <span className={`text-xs font-semibold ml-2 ${score === 3 ? 'text-green-500' : score === 2 ? 'text-amber-500' : 'text-red-400'}`}>
          {label}
        </span>
      </div>
      <div className="space-y-1">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {c.ok
              ? <FiCheck size={11} className="text-green-500 shrink-0" />
              : <FiX size={11} className="text-gray-300 shrink-0" />}
            <span className={c.ok ? 'text-green-600' : 'text-gray-400'}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SignUp() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:4000/signup', form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach server — make sure the backend is running on port 4000');
      } else {
        setError(err.response.data || 'Registration failed. Try a different username.');
      }
    } finally {
      setLoading(false);
    }
  };

  const particles = FOOD_EMOJIS.map((emoji, i) => ({
    emoji,
    style: {
      top: `${6 + (i * 13) % 88}%`,
      left: `${4 + (i * 17) % 90}%`,
      animationDelay: `${(i * 0.3) % 3}s`,
      fontSize: i % 3 === 0 ? '1.8rem' : '1.2rem',
      opacity: 0.12 + (i % 6) * 0.06,
      animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
    },
  }));

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div
        className="hidden md:flex md:w-1/2 lg:w-[45%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#7c3aed 0%,#db2777 55%,#ea580c 100%)' }}
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full animate-float" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />

        {particles.map((p, i) => (
          <div key={i} className="absolute select-none pointer-events-none" style={p.style}>{p.emoji}</div>
        ))}

        {/* Brand */}
        <div className="relative z-10 animate-fade-down">
          <Link to="/login" className="flex items-center gap-3 mb-2 group">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="text-white text-sm font-black">A</span>
            </div>
            <span className="text-white text-2xl font-black">Arrivio</span>
          </Link>
          <p className="text-pink-200 text-sm">Join thousands reducing food waste</p>
        </div>

        {/* Big headline */}
        <div className="relative z-10 animate-fade-up" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
          <h2 className="text-3xl font-black text-white leading-tight mb-6">
            Start saving food.<br />
            <span className="text-pink-200">Start saving money.</span>
          </h2>

          <div className="grid grid-cols-1 gap-2">
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/15 anim-start animate-slide-left"
                style={{ animationDelay: `${250 + i * 70}ms`, animationFillMode: 'forwards' }}
              >
                <span className="text-lg">{b.icon}</span>
                <p className="text-white/90 text-sm">{b.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 animate-fade-up" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex -space-x-2">
              {['🧑','👩','👨','🧑‍🍳','👩‍🍳'].map((e, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 border-2 border-white/40 flex items-center justify-center text-xs">
                  {e}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white text-sm font-bold">2,400+ users</p>
              <p className="text-pink-200 text-xs">already reducing waste</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f8fafc]">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile brand */}
          <div className="md:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-black">A</span>
            </div>
            <span className="text-xl font-black text-violet-500">
              Arrivio
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

            {/* Success state */}
            {success ? (
              <div className="flex flex-col items-center py-8 animate-bounce-in text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <FiCheckCircle size={40} className="text-green-500" />
                </div>
                <h2 className="text-xl font-black text-gray-800 mb-2">You're in! 🎉</h2>
                <p className="text-gray-400 text-sm">Account created successfully.<br />Redirecting to login…</p>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <h1 className="text-2xl font-black text-gray-800">Create account ✨</h1>
                  <p className="text-gray-400 text-sm mt-1">Free forever · No credit card needed</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 animate-fade-down">
                      <span>⚠️</span> {error}
                    </div>
                  )}

                  {/* Username */}
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      type="text"
                      placeholder="Username"
                      value={form.username}
                      onChange={set('username')}
                      className="_input pl-11 py-3.5"
                    />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={set('email')}
                      className="_input pl-11 py-3.5"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input
                        type={showPw ? 'text' : 'password'}
                        placeholder="Password"
                        value={form.password}
                        onChange={set('password')}
                        className="_input pl-11 pr-11 py-3.5"
                      />
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                    <PasswordStrength password={form.password} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading
                      ? <span className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <>Create Account <FiArrowRight size={16} /></>}
                  </button>

                  <p className="text-sm text-gray-500 text-center pt-1">
                    Already have an account?{' '}
                    <Link to="/login" className="text-violet-500 font-semibold hover:text-violet-700 transition-colors">
                      Sign in
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            By signing up, you agree to help reduce food waste 🌱
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Clock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTimeout = searchParams.get('reason') === 'timeout';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const loggedInUser = await login(email.trim(), password);
      navigate(loggedInUser.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#121212] flex flex-col items-center justify-center px-4 py-12 selection:bg-[#121212] selection:text-white">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-3 mb-8 group">
        <div className="w-10 h-10 rounded-full bg-[#121212] text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
          <span className="font-editorial text-xl italic">W</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#121212]">
          WealthWise
        </span>
      </Link>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#EAE6DF] p-8 sm:p-10 shadow-sm">
        <div className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7A746B]">
            Client Portal
          </span>
          <h1 className="font-editorial text-3xl font-normal text-[#121212] mt-1 tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[#7A746B]">
            Sign in to access your financial architecture
          </p>
        </div>

        {isTimeout && (
          <div className="mt-5 bg-[#FAF7F2] border border-[#E5DFD5] rounded-2xl p-4 flex gap-2.5 items-start">
            <Clock className="h-4 w-4 text-[#8C6D3F] shrink-0 mt-0.5" />
            <span className="text-xs text-[#6B5530]">
              Your session timed out after 15 minutes of inactivity for your security. Please sign in again.
            </span>
          </div>
        )}

        {error && (
          <div className="mt-5 bg-[#FDF3F2] border border-[#F3D1CE] rounded-2xl p-4 flex gap-2.5 items-start">
            <AlertCircle className="h-4 w-4 text-[#C24134] shrink-0 mt-0.5" />
            <span className="text-xs text-[#8B2318]">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#5A554E] mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl text-sm text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all placeholder-[#A19D94]"
              placeholder="user@wealthwise.demo"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#5A554E]">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-[#5A554E] hover:text-[#121212] underline underline-offset-4 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl text-sm text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all placeholder-[#A19D94]"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A746B] hover:text-[#121212]"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#121212] text-white font-semibold py-3.5 rounded-full hover:bg-[#2B2B30] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm tracking-wide shadow-xs flex items-center justify-center gap-2 group mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#F0ECE3] text-center text-xs text-[#7A746B]">
          New to WealthWise?{' '}
          <Link to="/register" className="text-[#121212] font-semibold underline underline-offset-4 hover:text-[#5A554E] transition-colors">
            Create an Account
          </Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-[#8E877C] max-w-sm text-center leading-relaxed">
        Protected with AES-256 encryption & stateless JWT session rotation.
      </p>
    </div>
  );
}

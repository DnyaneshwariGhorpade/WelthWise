import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-[#C24134]' };
  if (score <= 3) return { score, label: 'Fair', color: 'bg-[#C59B55]' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-[#2B523B]' };
  return { score, label: 'Robust', color: 'bg-[#121212]' };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (strength.score < 3) {
      setError('Password is too weak. Use at least 8 characters with uppercase, lowercase, and a number.');
      return;
    }
    if (!agreed) {
      setError('You must accept the terms and regulatory AI advisory disclaimer');
      return;
    }

    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      navigate('/app/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string; details?: Array<{ message: string }> } } } };
      const msg = axiosErr.response?.data?.error?.message || 'Registration failed. Please try again.';
      const details = axiosErr.response?.data?.error?.details;
      setError(details ? details.map((d) => d.message).join('. ') : msg);
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

      {/* Main Registration Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#EAE6DF] p-8 sm:p-10 shadow-sm">
        <div className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7A746B]">
            Client Onboarding
          </span>
          <h1 className="font-editorial text-3xl font-normal text-[#121212] mt-1 tracking-tight">
            Begin Your Wealth Plan
          </h1>
          <p className="mt-2 text-sm text-[#7A746B]">
            Set up your private encrypted personal wealth profile
          </p>
        </div>

        {error && (
          <div className="mt-5 bg-[#FDF3F2] border border-[#F3D1CE] rounded-2xl p-4 flex gap-2.5 items-start">
            <AlertCircle className="h-4 w-4 text-[#C24134] shrink-0 mt-0.5" />
            <span className="text-xs text-[#8B2318]">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-[#5A554E] mb-2">
              Full Legal Name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl text-sm text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all placeholder-[#A19D94]"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

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
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#5A554E] mb-2">
              Master Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl text-sm text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all placeholder-[#A19D94]"
                placeholder="Min. 8 characters"
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

            {/* Strength Bar */}
            {password && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#7A746B]">Security Strength</span>
                  <span className="font-semibold text-[#121212]">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-[#EAE6DF] rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-full flex-1 rounded-full transition-all ${
                        lvl <= strength.score ? strength.color : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-[#5A554E] mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl text-sm text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all placeholder-[#A19D94]"
              placeholder="Re-enter master password"
            />
          </div>

          {/* Terms & Advisory Disclaimer Checkbox */}
          <div className="pt-1 flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[#DDD7CD] text-[#121212] focus:ring-[#121212]"
            />
            <label htmlFor="terms" className="text-xs text-[#5A554E] leading-relaxed">
              I acknowledge that WealthWise provides algorithmic wealth modeling and educational AI insights, not certified financial advisory. I agree to the{' '}
              <a href="#" className="underline text-[#121212]">Terms of Service</a> and{' '}
              <a href="#" className="underline text-[#121212]">Privacy Charter</a>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#121212] text-white font-semibold py-3.5 rounded-full hover:bg-[#2B2B30] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm tracking-wide shadow-xs flex items-center justify-center gap-2 group mt-2"
          >
            <span>{loading ? 'Creating Vault...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#F0ECE3] text-center text-xs text-[#7A746B]">
          Already hold a WealthWise profile?{' '}
          <Link to="/login" className="text-[#121212] font-semibold underline underline-offset-4 hover:text-[#5A554E] transition-colors">
            Sign In Here
          </Link>
        </div>
      </div>

      {/* Trust Signatures */}
      <div className="mt-8 flex items-center gap-6 text-xs text-[#8E877C]">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#121212]" />
          <span>Zero Ads or Data Brokering</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#121212]" />
          <span>15-Minute Session Guard</span>
        </div>
      </div>
    </div>
  );
}

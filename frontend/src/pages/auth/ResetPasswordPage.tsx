import { useState, FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

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

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);

  if (!token) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] text-[#121212] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#EAE6DF] p-8 sm:p-10 text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-[#C24134] mx-auto mb-4" />
          <h1 className="font-editorial text-2xl font-normal text-[#121212]">Invalid Security Link</h1>
          <p className="mt-2 text-xs text-[#7A746B] leading-relaxed">
            This password reset token has expired or is invalid. Please request a new security link.
          </p>
          <Link
            to="/forgot-password"
            className="mt-6 inline-block text-xs font-semibold uppercase tracking-wider text-[#121212] underline underline-offset-4"
          >
            Request New Reset Token
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (strength.score < 3) {
      setError('Password must contain at least 8 characters with uppercase, lowercase, and a number.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      setSuccess(res);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || 'Password reset failed. Link may have expired.');
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

      {/* Main Form Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#EAE6DF] p-8 sm:p-10 shadow-sm">
        <div className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7A746B]">
            Security Update
          </span>
          <h1 className="font-editorial text-3xl font-normal text-[#121212] mt-1 tracking-tight">
            New Master Password
          </h1>
          <p className="mt-2 text-sm text-[#7A746B]">
            Choose a strong master key for your vault
          </p>
        </div>

        {error && (
          <div className="mt-5 bg-[#FDF3F2] border border-[#F3D1CE] rounded-2xl p-4 flex gap-2.5 items-start">
            <AlertCircle className="h-4 w-4 text-[#C24134] shrink-0 mt-0.5" />
            <span className="text-xs text-[#8B2318]">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-5 bg-[#F4F8F5] border border-[#D1E4D6] rounded-2xl p-4 flex gap-2.5 items-start">
            <CheckCircle2 className="h-4 w-4 text-[#2B523B] shrink-0 mt-0.5" />
            <span className="text-xs text-[#1F3D2C] leading-relaxed">
              {success} Redirecting you to sign in...
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#5A554E] mb-2">
              New Password
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

            {password && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#7A746B]">Strength</span>
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
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl text-sm text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all placeholder-[#A19D94]"
              placeholder="Confirm password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#121212] text-white font-semibold py-3.5 rounded-full hover:bg-[#2B2B30] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm tracking-wide shadow-xs flex items-center justify-center gap-2 group mt-2"
          >
            <span>{loading ? 'Updating Master Key...' : 'Update Password'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#F0ECE3] text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#5A554E] hover:text-[#121212] font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

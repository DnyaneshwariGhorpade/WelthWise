import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devToken, setDevToken] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDevToken(undefined);

    if (!email.trim()) {
      setError('Please enter your registered email address');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setSuccess(res.message);
      if (res.resetToken) {
        setDevToken(res.resetToken);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message || 'Something went wrong. Please try again.');
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

      {/* Main Recovery Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#EAE6DF] p-8 sm:p-10 shadow-sm">
        <div className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7A746B]">
            Credential Recovery
          </span>
          <h1 className="font-editorial text-3xl font-normal text-[#121212] mt-1 tracking-tight">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-[#7A746B]">
            Enter your account email to receive a secure reset link
          </p>
        </div>

        {error && (
          <div className="mt-5 bg-[#FDF3F2] border border-[#F3D1CE] rounded-2xl p-4 flex gap-2.5 items-start">
            <AlertCircle className="h-4 w-4 text-[#C24134] shrink-0 mt-0.5" />
            <span className="text-xs text-[#8B2318]">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-5 bg-[#F4F8F5] border border-[#D1E4D6] rounded-2xl p-4 space-y-3">
            <div className="flex gap-2.5 items-start">
              <CheckCircle2 className="h-4 w-4 text-[#2B523B] shrink-0 mt-0.5" />
              <span className="text-xs text-[#1F3D2C] leading-relaxed">{success}</span>
            </div>
            {devToken && (
              <div className="mt-2 pt-2 border-t border-[#D1E4D6] text-xs">
                <span className="text-[#5A554E] block mb-1">Development quick-access link:</span>
                <Link
                  to={`/reset-password?token=${devToken}`}
                  className="inline-flex items-center gap-1 font-semibold text-[#121212] underline underline-offset-4"
                >
                  <span>Open Reset Link</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#5A554E] mb-2">
              Registered Email
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#121212] text-white font-semibold py-3.5 rounded-full hover:bg-[#2B2B30] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm tracking-wide shadow-xs flex items-center justify-center gap-2 group mt-2"
          >
            <span>{loading ? 'Transmitting Link...' : 'Send Reset Link'}</span>
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

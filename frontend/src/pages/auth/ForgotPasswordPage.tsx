import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, AlertCircle, CheckCircle2, ArrowLeft, ExternalLink } from 'lucide-react';

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
      setError('Please enter your email address');
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <Shield className="h-8 w-8 text-emerald-600" />
        <span className="text-2xl font-bold text-slate-900">WealthWise</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900 text-center">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-500 text-center">
          Enter your email and we'll send you a reset link
        </p>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
            <div className="flex gap-2 items-start">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-sm text-emerald-800 font-medium">{success}</span>
            </div>

            {devToken && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <div className="font-semibold text-amber-900 mb-1">Development Mode Notice:</div>
                Live email provider (Resend / SMTP) is not configured in environment settings.
                <div className="mt-2">
                  <Link
                    to={`/reset-password?token=${devToken}`}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    Click here to open password reset form <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

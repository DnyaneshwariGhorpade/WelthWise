import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Target, AlertTriangle, Users, Award } from 'lucide-react';
import { getPublicHighlights, PublicHighlights } from '../../services/app.service';

const defaultFeatures = [
  {
    id: 'wealth-score',
    title: 'Wealth Score',
    description: 'Get a dynamic, AI-calculated score that tracks your overall financial health across savings, debt, liquidity, and growth.',
    iconName: 'TrendingUp',
  },
  {
    id: 'stress-test',
    title: 'Stress Testing',
    description: 'Simulate job loss, market crashes, or rate hikes to see exactly how long your finances can survive each scenario.',
    iconName: 'AlertTriangle',
  },
  {
    id: 'goal-conflict',
    title: 'Goal Conflict Advisor',
    description: 'Detect when competing financial goals clash and receive AI-powered recommendations on how to resolve them.',
    iconName: 'Target',
  },
];

const steps = [
  { num: '1', title: 'Create Your Account', desc: 'Sign up in seconds and set up your secure financial profile.' },
  { num: '2', title: 'Add Your Data', desc: 'Input your income, expenses, assets, liabilities, and investments.' },
  { num: '3', title: 'Get AI Insights', desc: 'Receive your Wealth Score, stress-test results, and personalized advice instantly.' },
];

function renderIcon(name: string) {
  switch (name) {
    case 'TrendingUp':
      return <TrendingUp className="h-6 w-6 text-emerald-600" />;
    case 'AlertTriangle':
      return <AlertTriangle className="h-6 w-6 text-emerald-600" />;
    default:
      return <Target className="h-6 w-6 text-emerald-600" />;
  }
}

export default function LandingPage() {
  const [highlights, setHighlights] = useState<PublicHighlights | null>(null);

  useEffect(() => {
    getPublicHighlights()
      .then((data) => setHighlights(data))
      .catch((err) => console.warn('Failed to load public highlights, falling back:', err.message));
  }, []);

  const featureList = highlights?.features?.length
    ? highlights.features.map((f) => ({ ...f, iconName: f.icon }))
    : defaultFeatures;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-emerald-600" />
            <span className="text-xl font-bold text-slate-900">WealthWise</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a>
            <a href="#security" className="hover:text-emerald-600 transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors px-3 py-2">Sign In</Link>
            <Link to="/register" className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">Create Account</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              {highlights?.heroTitle || 'Your AI-Powered Personal Wealth Planner'}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-emerald-100 max-w-2xl">
              {highlights?.heroSubtitle || 'WealthWise analyzes your complete financial picture and delivers actionable insights to help you build, protect, and grow your wealth with confidence.'}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="inline-flex items-center justify-center bg-white text-emerald-700 font-semibold px-6 py-3 rounded-lg hover:bg-emerald-50 transition-colors text-base">
                Get Started Free
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors text-base">
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Powerful Financial Intelligence</h2>
            <p className="mt-3 text-slate-500 max-w-2xl mx-auto">Everything you need to understand, optimize, and protect your financial future.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featureList.map((f) => (
              <div key={f.id || f.title} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                  {renderIcon(f.iconName)}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          {highlights?.platformStats && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{highlights.platformStats.totalRegisteredUsers}</div>
                  <div className="text-xs text-slate-500">Registered Users</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{highlights.platformStats.scoresGenerated}</div>
                  <div className="text-xs text-slate-500">Wealth Scores Generated</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{highlights.platformStats.securityStandard}</div>
                  <div className="text-xs text-slate-500">Security Protection</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-3 text-slate-500">Three simple steps to take control of your finances.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-5">{s.num}</div>
                <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-12 w-12 text-emerald-600 mx-auto mb-5" />
            <h2 className="text-3xl font-bold text-slate-900">Bank-Grade Security</h2>
            <p className="mt-4 text-slate-500 leading-relaxed">
              Your financial data is protected with AES-256 encryption, JWT-based session management,
              automatic account lockout, and a full audit trail. We never sell your data.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6 text-sm text-slate-600">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="font-semibold text-slate-900">Encrypted</div>
                <div className="mt-1">AES-256 at rest</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="font-semibold text-slate-900">JWT Sessions</div>
                <div className="mt-1">Expiring tokens</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="font-semibold text-slate-900">Audit Trail</div>
                <div className="mt-1">Full logging</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Ready to Take Control?</h2>
          <p className="mt-3 text-emerald-100 max-w-xl mx-auto">Join WealthWise and start your journey toward financial clarity and confidence.</p>
          <Link to="/register" className="mt-8 inline-flex items-center bg-white text-emerald-700 font-semibold px-8 py-3 rounded-lg hover:bg-emerald-50 transition-colors text-base">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* AI Disclaimer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-8 flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-slate-400">
              <span className="font-semibold text-slate-300">AI Disclaimer:</span> {highlights?.disclaimer || 'WealthWise uses artificial intelligence to generate financial insights, scores, and recommendations. This content is for informational and educational purposes only and does not constitute certified financial advice. Always consult a qualified financial advisor before making investment or financial decisions.'}
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-slate-500">&copy; {new Date().getFullYear()} WealthWise. All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Lock, ArrowLeft, EyeOff, Server, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#121212] selection:bg-[#121212] selection:text-white antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FBF9F6]/95 backdrop-blur-md border-b border-[#EAE6DF]">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-[#121212] text-white flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="font-editorial text-lg italic">W</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#121212]">WealthWise</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#5A554E] hover:text-[#121212] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <div className="space-y-4 border-b border-[#EAE6DF] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E0DBD1] text-[11px] font-semibold uppercase tracking-widest text-[#666056]">
            <Lock className="w-3.5 h-3.5 text-[#121212]" />
            Privacy by Design & Cryptographic Guarantees
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-[#121212] tracking-tight">
            WealthWise Privacy Charter
          </h1>
          <p className="text-sm text-[#7A746B]">
            Effective Date: October 2026 &bull; Strict Zero Data Monetization Commitment
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E0DBD1] space-y-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#E0DBD1] flex items-center justify-center text-[#121212]">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#121212]">Zero Data Selling</h3>
            <p className="text-xs text-[#5A554E] leading-relaxed">
              We never sell, rent, or lease your financial ledgers to third-party advertisers, credit card issuers, or loan brokers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E0DBD1] space-y-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#E0DBD1] flex items-center justify-center text-[#121212]">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#121212]">AES-256 Storage</h3>
            <p className="text-xs text-[#5A554E] leading-relaxed">
              All financial database fields and authentication credentials are encrypted at rest with industry-standard cryptographic algorithms.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E0DBD1] space-y-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#E0DBD1] flex items-center justify-center text-[#121212]">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#121212]">Stateless JWT Rotation</h3>
            <p className="text-xs text-[#5A554E] leading-relaxed">
              Session tokens are rotated every 15 minutes and immediately blacklisted in high-speed Redis memory upon user logout.
            </p>
          </div>
        </div>

        {/* Section 1: AI Processing & Confidentiality */}
        <section className="space-y-4">
          <h2 className="font-editorial text-2xl font-bold text-[#121212]">
            1. Artificial Intelligence Data Processing Policy
          </h2>
          <p className="text-sm sm:text-base text-[#5A554E] leading-relaxed">
            When you interact with the WealthWise Advisor, your financial numbers (such as monthly income, aggregated expenses, and emergency reserves) are transmitted via TLS 1.3 encrypted channels to generate contextual advice.
          </p>
          <div className="p-4 rounded-xl bg-white border border-[#E0DBD1] space-y-2 text-xs text-[#5A554E]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Zero Customer Training:</strong> Your financial inputs are never used to train public machine learning foundation models.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Data Minimization:</strong> Only relevant aggregate figures needed to answer your query are passed to the AI engine.</span>
            </div>
          </div>
        </section>

        {/* Section 2: Audit Logs & Immutability */}
        <section className="space-y-4">
          <h2 className="font-editorial text-2xl font-bold text-[#121212]">
            2. Audit Trails & Transparency
          </h2>
          <p className="text-sm sm:text-base text-[#5A554E] leading-relaxed">
            For academic and enterprise compliance, administrative operations (such as AI provider reconfiguration and session audits) are recorded into immutable database audit logs with timestamps and actor tracking.
          </p>
        </section>

        <div className="pt-8 border-t border-[#EAE6DF] flex items-center justify-between">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-[#121212] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-[#2B2B30] transition-colors"
          >
            <span>Create Secure Account</span>
          </Link>
          <Link
            to="/terms"
            className="text-xs text-[#5A554E] hover:text-[#121212] underline underline-offset-4"
          >
            Read Terms of Service &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}

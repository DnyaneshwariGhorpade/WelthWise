import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowRight,
  CheckCircle2, 
  SlidersHorizontal,
  ChevronRight,
  Lock,
  Sparkles,
  Quote
} from 'lucide-react';
import { getPublicHighlights, PublicHighlights } from '../../services/app.service';

const pillars = [
  {
    num: '01',
    title: 'Liquidity & Runway Cushion',
    tag: 'Capital Safety',
    desc: 'Calculates your liquid emergency buffer against monthly burn. Guarantees you never liquidate long-term assets under market distress.',
    metric: '6+ Months Safe Target',
  },
  {
    num: '02',
    title: 'Debt-to-Income Health',
    tag: 'Liability Control',
    desc: 'Continuously monitors loan EMIs and credit exposure relative to gross cashflow, keeping leverage well within the optimal <30% threshold.',
    metric: '< 25% Optimal DTI',
  },
  {
    num: '03',
    title: 'Savings & Capital Deployment',
    tag: 'Wealth Velocity',
    desc: 'Tracks active wealth generation rate and monthly allocation into productive, compounding investment instruments.',
    metric: '35% Average Target',
  },
  {
    num: '04',
    title: 'Net Worth Trajectory',
    tag: 'Long-Term Horizon',
    desc: 'Synthesizes total asset appreciation against debt amortisation, projecting your net worth trajectory across 5, 10, and 20 years.',
    metric: 'Compound Growth Index',
  },
];

const scenarios = [
  {
    name: 'Career Transition / Layoff',
    incomeDrop: '-100%',
    runwayMonths: 9.4,
    status: 'Protected',
    note: 'Emergency cushion absorbs 100% of fixed living expenses without liquidating investments.',
  },
  {
    name: 'Emergency Medical Shock',
    incomeDrop: '-20%',
    runwayMonths: 14.8,
    status: 'Resilient',
    note: 'Health reserve covers hospitalisation copay while discretionary budgets auto-freeze.',
  },
  {
    name: 'High Inflation & RBI Rate Hike',
    incomeDrop: '0%',
    runwayMonths: 18.2,
    status: 'Optimal',
    note: 'Portfolio yield offsets 25% cost-of-living surges and home loan interest adjustments.',
  },
];

const steps = [
  { 
    num: '01', 
    title: 'Consolidate Financial Ledgers', 
    desc: 'Link or input recurring incomes, fixed household obligations, investment holdings, and liabilities into your private encrypted vault.' 
  },
  { 
    num: '02', 
    title: 'Evaluate Mathematical Score & Shocks', 
    desc: 'The deterministic 4-pillar engine evaluates your 0–100 Wealth Score and stress-tests your survival runway across simulated market crises.' 
  },
  { 
    num: '03', 
    title: 'Navigate Decisions with AI Advisory', 
    desc: 'Evaluate discretionary purchases against multi-horizon goals with intelligent goal conflict detection and plain-English AI coaching.' 
  },
];

export default function LandingPage() {
  const [highlights, setHighlights] = useState<PublicHighlights | null>(null);
  const [activeScenario, setActiveScenario] = useState(0);

  useEffect(() => {
    getPublicHighlights()
      .then((data) => setHighlights(data))
      .catch((err) => console.warn('Failed to load public highlights, falling back:', err.message));
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#121212] selection:bg-[#121212] selection:text-[#FFFFFF] antialiased">
      
      {/* 1. Header / Navigation (Passero Boutique Minimalist) */}
      <header className="sticky top-0 z-50 bg-[#FBF9F6]/95 backdrop-blur-md border-b border-[#EAE6DF] transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-[#121212] text-white flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="font-editorial text-lg italic">W</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#121212]">
              WealthWise
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-9 text-[13px] font-medium tracking-wide uppercase text-[#5A554E]">
            <a href="#gallery" className="hover:text-[#121212] transition-colors">Philosophy</a>
            <a href="#pillars" className="hover:text-[#121212] transition-colors">The 4 Pillars</a>
            <a href="#simulator" className="hover:text-[#121212] transition-colors">Stress Testing</a>
            <a href="#methodology" className="hover:text-[#121212] transition-colors">How It Works</a>
            <a href="#security" className="hover:text-[#121212] transition-colors">Security</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-xs font-semibold tracking-wide uppercase text-[#444444] hover:text-[#121212] px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase bg-[#121212] text-white px-5 py-2.5 rounded-full hover:bg-[#2A2A2E] transition-all shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Passero Asymmetric Fluid Grid with Warm Editorial Photography) */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-6 lg:px-12 overflow-hidden border-b border-[#EAE6DF]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Editorial Statement */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E0DBD1] text-[11px] font-semibold uppercase tracking-widest text-[#666056] shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#121212] animate-pulse"></span>
                Deterministic Wealth Engine & AI Advisory
              </div>

              <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.08] text-[#121212] tracking-tight">
                A quieter, more <span className="italic font-normal">intelligent</span> way to master wealth.
              </h1>

              <p className="text-base sm:text-lg text-[#5A554E] max-w-xl font-normal leading-relaxed">
                {highlights?.heroSubtitle || 
                  'WealthWise unifies cashflow ledgers, calculates an explainable 4-pillar financial score, models macroeconomic stress shocks, and aligns every expenditure with long-term goals.'}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-3 bg-[#121212] text-white font-semibold text-sm px-8 py-4 rounded-full hover:bg-[#2B2B30] transition-all shadow-md group"
                >
                  <span>Build Your Financial Model</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="#simulator"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#121212] border border-[#D5CFC5] font-semibold text-sm px-7 py-4 rounded-full hover:bg-[#EFECE6] transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#666056]" />
                  <span>Simulate Stress Shocks</span>
                </a>
              </div>

              {/* Sub-credibility Note */}
              <div className="pt-4 flex items-center gap-6 text-xs text-[#7A746B]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#121212]" />
                  <span>Zero Advertisements</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#121212]" />
                  <span>Deterministic Math</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#121212]" />
                  <span>Bank-Grade AES-256</span>
                </div>
              </div>
            </div>

            {/* Right Column: Fluid Layered Editorial Photo Frame */}
            <div className="lg:col-span-5 relative">
              
              {/* Outer Framing Bezel */}
              <div className="relative rounded-3xl bg-[#ECE7DE] p-3 sm:p-4 border border-[#DDD7CD] shadow-xl">
                
                {/* Hero Editorial Photography Container */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#D8D2C6]">
                  <img 
                    src="/images/gallery_1.jpg" 
                    alt="WealthWise Financial Architecture"
                    className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700" 
                  />
                  
                  {/* Subtle Gradient Shade for Layered Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                  {/* Overlaid Floating Wealth Badge (Passero Style) */}
                  <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-white/40 shadow-lg text-[#121212]">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE3]">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-[#666056]">Live Financial Index</div>
                        <div className="text-base font-bold text-[#121212]">Rahul Sharma</div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#121212] text-white text-[10px] font-mono-nums">
                        SCORE 88
                      </span>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs text-[#5A554E]">
                      <span>Emergency Runway:</span>
                      <span className="font-semibold text-[#121212] font-mono-nums">12.4 Months (Safe)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Floating Accent Pill */}
              <div className="hidden sm:flex absolute -bottom-4 -left-6 bg-[#121212] text-white px-5 py-3 rounded-2xl shadow-xl border border-[#333338] items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#D5CFC5]" />
                <div className="text-xs">
                  <div className="font-semibold">Goal Feasibility Evaluated</div>
                  <div className="text-[#A19D94] text-[11px]">Home Purchase 2028: On Track</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. NEW: The Passero 3-Column Photographic Gallery Section (Directly like your screenshot!) */}
      <section id="gallery" className="py-24 px-6 lg:px-12 bg-white border-b border-[#EAE6DF]">
        <div className="max-w-7xl mx-auto space-y-14">
          
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#7A746B]">
              The Wealth Experience
            </div>
            <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-[#121212] mt-3 tracking-tight">
              Calm, disciplined finance. Captured in every detail.
            </h2>
            <p className="text-base text-[#5A554E] mt-3 max-w-2xl leading-relaxed">
              Real wealth isn't volatile speculation or endless spreadsheets. It is the quiet freedom of knowing your ledgers are balanced, your future is funded, and your family is shielded.
            </p>
          </div>

          {/* 3-Column Photographic Layout (1 Vertical, 2 Horizontal Stacked, 1 Vertical) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            
            {/* Column 1: Vertical Photo (Left) */}
            <div className="md:col-span-4 flex flex-col">
              <div className="relative rounded-2xl overflow-hidden bg-[#ECE7DE] aspect-[3/4] border border-[#DDD7CD] shadow-sm group flex-1">
                <img 
                  src="/images/gallery_1.jpg" 
                  alt="Modern Financial Workspace" 
                  className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-white text-sm font-editorial italic">Dedicated Wealth Architecture</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-[#7A746B] flex items-center justify-between px-1">
                <span className="font-medium text-[#121212]">01. Systematic Tracking</span>
                <span>Real-time Ledger</span>
              </div>
            </div>

            {/* Column 2: Two Stacked Horizontal Photos (Middle) */}
            <div className="md:col-span-4 flex flex-col gap-6">
              
              {/* Top Stacked Photo */}
              <div className="flex flex-col flex-1">
                <div className="relative rounded-2xl overflow-hidden bg-[#ECE7DE] aspect-[4/3] border border-[#DDD7CD] shadow-sm group flex-1">
                  <img 
                    src="/images/gallery_2.jpg" 
                    alt="Financial Strategy & Goal Journaling" 
                    className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                    <span className="text-white text-xs font-editorial italic">Disciplined Goal Allocation</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-[#7A746B] px-1">
                  <span className="font-medium text-[#121212]">02. Goal Harmony</span> &bull; Multi-Horizon Plans
                </div>
              </div>

              {/* Bottom Stacked Photo */}
              <div className="flex flex-col flex-1">
                <div className="relative rounded-2xl overflow-hidden bg-[#ECE7DE] aspect-[4/3] border border-[#DDD7CD] shadow-sm group flex-1">
                  <img 
                    src="/images/gallery_3.jpg" 
                    alt="Portfolio Review over Coffee" 
                    className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                    <span className="text-white text-xs font-editorial italic">Clarity Anywhere, Anytime</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-[#7A746B] px-1">
                  <span className="font-medium text-[#121212]">03. Daily Peace of Mind</span> &bull; Mobile Ready
                </div>
              </div>

            </div>

            {/* Column 3: Vertical Photo (Right) */}
            <div className="md:col-span-4 flex flex-col">
              <div className="relative rounded-2xl overflow-hidden bg-[#ECE7DE] aspect-[3/4] border border-[#DDD7CD] shadow-sm group flex-1">
                <img 
                  src="/images/gallery_4.jpg" 
                  alt="Confident Wealth Builder" 
                  className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-white text-sm font-editorial italic">The Horizon of Independence</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-[#7A746B] flex items-center justify-between px-1">
                <span className="font-medium text-[#121212]">04. Long-Term Autonomy</span>
                <span>Generational Security</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Editorial Statement Banner (Clean Minimalist Luxury) */}
      <section className="relative py-24 md:py-32 px-6 lg:px-12 bg-[#161412] text-white border-b border-[#2C2824]">
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mx-auto">
            <Quote className="w-5 h-5 text-white" />
          </div>

          <blockquote className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.25] text-white tracking-tight">
            “Since modeling our emergency runway and stress shocks with WealthWise, our capital decisions are disciplined, and our long-term goals are finally on autopilot.”
          </blockquote>

          <div className="pt-2">
            <div className="text-sm font-semibold text-white tracking-wide">
              Verified Private Client
            </div>
            <div className="text-xs uppercase tracking-widest text-[#B5AEA4] mt-1">
              Active Member &bull; Long-Term Wealth Model
            </div>
          </div>
        </div>
      </section>

      {/* 5. The 4 Pillars Section (Passero Staggered Numbered Cards) */}
      <section id="pillars" className="py-24 px-6 lg:px-12 bg-[#FBF9F6] border-b border-[#EAE6DF]">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#7A746B]">
              The Core Engine
            </div>
            <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-[#121212] mt-3 tracking-tight">
              Four pillars. One unambiguous picture of financial truth.
            </h2>
            <p className="text-base text-[#5A554E] mt-4 leading-relaxed">
              Unlike generic credit scores designed for lenders, the WealthWise score is calibrated exclusively for your resilience, security, and long-term autonomy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar) => (
              <div
                key={pillar.num}
                className="bg-white rounded-2xl p-8 border border-[#E0DBD1] hover:border-[#121212] transition-all hover:shadow-lg flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-[#F0ECE3]">
                    <span className="font-editorial text-2xl font-bold text-[#121212] group-hover:italic transition-all">
                      {pillar.num}.
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-[#F5F2EB] text-[#4A453E]">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="font-editorial text-xl font-bold text-[#121212] mt-6 tracking-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5A554E] mt-3 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#F0ECE3] flex items-center justify-between text-xs">
                  <span className="text-[#8E877C]">Benchmark</span>
                  <span className="font-semibold text-[#121212] font-mono-nums">{pillar.metric}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Interactive Stress Testing Simulator Preview */}
      <section id="simulator" className="py-24 px-6 lg:px-12 bg-white border-b border-[#EAE6DF]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#7A746B]">
                Macroeconomic Simulation
              </div>
              <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-[#121212] tracking-tight">
                Simulate shocks <span className="italic font-normal">before</span> reality tests them.
              </h2>
              <p className="text-sm sm:text-base text-[#5A554E] leading-relaxed">
                What happens to your mortgage, SIPs, and lifestyle if primary consulting contracts dry up or family medical expenses surge? WealthWise calculates your exact survival runway to the day.
              </p>

              {/* Scenario Selectors */}
              <div className="space-y-3 pt-2">
                {scenarios.map((sc, idx) => (
                  <button
                    key={sc.name}
                    onClick={() => setActiveScenario(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                      activeScenario === idx
                        ? 'bg-[#121212] text-white border-[#121212] shadow-md'
                        : 'bg-[#F9F7F4] text-[#121212] border-[#E5E0D6] hover:bg-[#EFECE5]'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold">{sc.name}</div>
                      <div className={`text-xs mt-0.5 ${activeScenario === idx ? 'text-[#B5AEA4]' : 'text-[#7A746B]'}`}>
                        Income Shock: {sc.incomeDrop}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${activeScenario === idx ? 'text-white' : 'text-[#8E877C]'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live Output Panel */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-[#ECE7DE] p-4 sm:p-5 border border-[#DDD7CD]">
                <div className="bg-white rounded-2xl p-8 border border-[#E0DBD1] space-y-8">
                  
                  <div className="flex items-center justify-between pb-6 border-b border-[#F0ECE3]">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A746B]">Simulated Crisis</span>
                      <h3 className="text-xl font-bold text-[#121212] tracking-tight mt-0.5">
                        {scenarios[activeScenario].name}
                      </h3>
                    </div>
                    <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#F5F2EB] text-[#121212] font-mono-nums">
                      STATUS: {scenarios[activeScenario].status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#ECE7DE]">
                      <span className="text-xs text-[#666056]">Simulated Survival Runway</span>
                      <div className="font-editorial text-4xl font-bold text-[#121212] mt-1 font-mono-nums">
                        {scenarios[activeScenario].runwayMonths}
                        <span className="text-base font-sans font-normal text-[#8E877C] ml-2">months</span>
                      </div>
                      <div className="text-[11px] text-[#2E7D32] font-medium mt-1">Exceeds 6-month safety benchmark</div>
                    </div>

                    <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#ECE7DE]">
                      <span className="text-xs text-[#666056]">Portfolio Drawdown Risk</span>
                      <div className="font-editorial text-4xl font-bold text-[#121212] mt-1 font-mono-nums">
                        0.0%
                      </div>
                      <div className="text-[11px] text-[#5A554E] font-medium mt-1">No forced asset liquidation required</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FBF9F6] border border-[#E5E0D6] text-xs text-[#4A453E] leading-relaxed">
                    <span className="font-semibold text-[#121212]">Engine Finding:</span> {scenarios[activeScenario].note}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#121212] hover:text-[#5A554E] transition-colors"
                    >
                      <span>Run Custom Scenario on Your Ledgers</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Methodology / Three-Stage Architecture */}
      <section id="methodology" className="py-24 px-6 lg:px-12 bg-[#FBF9F6] border-b border-[#EAE6DF]">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#7A746B]">
              Three-Stage Architecture
            </div>
            <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-[#121212] mt-3 tracking-tight">
              Designed for precision. Built for peace of mind.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((st) => (
              <div 
                key={st.num}
                className="bg-white rounded-2xl p-8 border border-[#E0DBD1] space-y-5 flex flex-col justify-between"
              >
                <div>
                  <div className="font-editorial text-3xl font-bold text-[#121212] pb-4 border-b border-[#F0ECE3]">
                    {st.num}
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-[#121212] mt-4 tracking-tight">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A554E] mt-2.5 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
                <div className="pt-4 text-xs font-semibold text-[#121212] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Phase {st.num} Completed</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. Institutional Grade Security */}
      <section id="security" className="py-24 px-6 lg:px-12 bg-[#121214] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-mono tracking-wider uppercase text-[#D5CFC5]">
                <Lock className="w-3 h-3 text-white" />
                <span>Stateless & Encrypted</span>
              </div>

              <h2 className="font-editorial text-4xl sm:text-5xl font-normal tracking-tight text-white">
                Bank-grade privacy, built from first principles.
              </h2>

              <p className="text-sm sm:text-base text-[#A19D94] leading-relaxed">
                Your financial architecture belongs exclusively to you. WealthWise employs end-to-end AES-256 field encryption, stateless JWT rotation, instantaneous token revocation via Redis, and automated account lockout defenses.
              </p>

              <div className="pt-4 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <div className="font-semibold text-sm text-white">Zero Third-Party Selling</div>
                  <div className="text-xs text-[#8E877C] mt-1">No broker referrals or ad trackers</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <div className="font-semibold text-sm text-white">Audited Immutability</div>
                  <div className="text-xs text-[#8E877C] mt-1">Full cryptographically logged audit trail</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <span className="text-xs uppercase tracking-wider text-[#A19D94]">Security Matrix</span>
                  <span className="text-xs font-mono text-[#D5CFC5]">ACTIVE COMPLIANCE</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-[#A19D94]">Encryption at Rest</span>
                    <span className="font-mono text-white">AES-256 GCM</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-[#A19D94]">Session Management</span>
                    <span className="font-mono text-white">HS256 Stateless + Redis Revoke</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-[#A19D94]">Brute-Force Shield</span>
                    <span className="font-mono text-white">5-Attempt Lockout (15 min)</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#A19D94]">AI Model Privacy</span>
                    <span className="font-mono text-white">Zero Customer Training Retention</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Bottom Statement CTA */}
      <section className="py-24 px-6 lg:px-12 bg-white text-center border-b border-[#EAE6DF]">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="w-12 h-12 rounded-full bg-[#121212] text-white flex items-center justify-center mx-auto">
            <span className="font-editorial text-2xl italic">W</span>
          </div>

          <h2 className="font-editorial text-4xl sm:text-6xl font-normal text-[#121212] tracking-tight">
            Clarity begins with a single ledger.
          </h2>

          <p className="text-base text-[#5A554E] max-w-xl mx-auto leading-relaxed">
            Take twenty minutes to model your complete financial life. Understand your vulnerabilities, celebrate your resilience, and compound your wealth with certainty.
          </p>

          <div>
            <Link
              to="/register"
              className="inline-flex items-center gap-3 bg-[#121212] text-white font-semibold text-sm px-9 py-4 rounded-full hover:bg-[#2B2B30] transition-all shadow-md group"
            >
              <span>Create Your Account</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Minimalist Editorial Footer & AI Disclaimer */}
      <footer className="bg-[#FBF9F6] text-[#7A746B] py-14 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* AI Regulatory Disclaimer Box */}
          <div className="rounded-2xl bg-white p-5 sm:p-6 border border-[#E0DBD1] flex items-start gap-4">
            <AlertTriangle className="w-4 h-4 text-[#121212] shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-[#5A554E]">
              <strong className="text-[#121212]">Regulatory Compliance & AI Advisory Notice:</strong> {highlights?.disclaimer || 'WealthWise utilizes algorithmic engines and large language model adapters (Gemini / OpenAI) to analyze user-provided ledgers, stress-test survival scenarios, and deliver contextual wealth coaching. All outputs are strictly informational and educational, and do not constitute certified financial, legal, or tax advice. Consult a certified financial planner (CFP / SEBI RIA) prior to executing capital transactions.'}
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[#EAE6DF] text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#121212]">WealthWise</span>
              <span className="text-[#B5AEA4]">&bull;</span>
              <span>&copy; {new Date().getFullYear()} WealthWise Systems Inc. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-6 text-[#7A746B]">
              <a href="#" className="hover:text-[#121212] transition-colors">Security Architecture</a>
              <a href="#" className="hover:text-[#121212] transition-colors">Privacy Charter</a>
              <a href="#" className="hover:text-[#121212] transition-colors">Terms of Service</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

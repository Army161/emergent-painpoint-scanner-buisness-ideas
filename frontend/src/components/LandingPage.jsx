import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radar, ArrowRight, TrendingUp, Zap, FileText, Shield, ChevronRight, CheckCircle } from 'lucide-react';
import OpportunityRing from './OpportunityRing';

const TICKER_ITEMS = [
  { src: 'Reddit', srcCls: 'badge-reddit', score: 91, title: 'AI Video Interview Pre-Screener for SMBs', revenue: '$100K–$500K/mo', pain: 'severe' },
  { src: 'LinkedIn', srcCls: 'badge-linkedin', score: 89, title: 'Health Insurance Navigator for Self-Employed', revenue: '$60K–$250K/mo', pain: 'severe' },
  { src: 'Indie Hackers', srcCls: 'badge-indiehackers', score: 88, title: 'AI Contract Red-Flag Detector for Founders', revenue: '$40K–$160K/mo', pain: 'severe' },
  { src: 'Reddit', srcCls: 'badge-reddit', score: 87, title: 'Multi-Currency Invoice Reconciliation', revenue: '$50K–$200K/mo', pain: 'severe' },
  { src: 'Indie Hackers', srcCls: 'badge-indiehackers', score: 82, title: 'Micro-SaaS Portfolio Analytics Dashboard', revenue: '$20K–$80K/mo', pain: 'moderate' },
  { src: 'Reddit', srcCls: 'badge-reddit', score: 85, title: 'Restaurant Staff Shift Scheduler for Small Teams', revenue: '$20K–$80K/mo', pain: 'moderate' },
  { src: 'App Store', srcCls: 'badge-appstore', score: 76, title: 'App Store Review → Product Roadmap AI', revenue: '$15K–$60K/mo', pain: 'moderate' },
  { src: 'Product Hunt', srcCls: 'badge-producthunt', score: 73, title: 'Podcast Transcript → Multi-Platform Content Kit', revenue: '$15K–$60K/mo', pain: 'moderate' },
];

const TickerCard = ({ item }) => {
  const painColor = item.pain === 'severe' ? '#EF4444' : '#EAB308';
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '14px 16px', marginBottom: 10, width: 280 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span className={`badge ${item.srcCls}`} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, border: '1px solid', fontWeight: 600 }}>{item.src}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: painColor }} />
          <span className="mono" style={{ fontSize: 11, color: '#6366F1', fontWeight: 700 }}>{item.score}</span>
        </div>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{item.title}</p>
      <span style={{ fontSize: 11, color: '#22C55E', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{item.revenue}</span>
    </div>
  );
};

const FEATURES = [
  {
    icon: <TrendingUp size={20} color="#818CF8" />,
    title: 'Pain Point Intelligence',
    desc: 'AI continuously monitors Reddit, Twitter/X, LinkedIn, App Store reviews, Product Hunt, and Indie Hackers — surfacing real problems people are begging to have solved.',
    stat: '6 sources',
  },
  {
    icon: <Zap size={20} color="#F59E0B" />,
    title: 'Opportunity Scoring Engine',
    desc: 'Each pain point is scored across 4 dimensions: market size, competition gap, revenue potential, and timing. No more gut-feeling guesses.',
    stat: '4-dimension score',
  },
  {
    icon: <FileText size={20} color="#22C55E" />,
    title: 'One-Click Business Brief',
    desc: 'Click generate. Get a full business brief — ICP, pricing tiers, 90-day launch plan, competition analysis, and go-to-market strategy. In seconds.',
    stat: 'Full brief in <30s',
  },
  {
    icon: <Shield size={20} color="#EF4444" />,
    title: 'Landing Page Copy Generator',
    desc: 'Turn any validated opportunity into a high-converting landing page. Hero headline, value props, testimonials, pricing copy — ready to launch.',
    stat: 'Launch-ready copy',
  },
];

const TESTIMONIALS = [
  { text: 'Found my next product in 20 minutes. The AI brief saved me 3 weeks of market research.', name: 'Marcus Reid', title: 'Solo Founder', product: 'Built 4 micro-SaaS' },
  { text: 'The competition gap analysis alone is worth the price. Nobody is doing this level of validation at this speed.', name: 'Priya Nair', title: 'Product Manager', product: 'Ex-Stripe, building indie' },
  { text: "Every serious indie hacker needs this. Stop guessing what to build. The data is right here.", name: 'Tom Becker', title: 'Indie Hacker', product: '$8K MRR' },
];

const LandingPage = () => {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState({ ideas: 0, briefs: 0, users: 0 });

  useEffect(() => {
    setMounted(true);
    // Animate counters
    const targets = { ideas: 14892, briefs: 3247, users: 1841 };
    const duration = 2000;
    const start = performance.now();
    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({
        ideas: Math.floor(targets.ideas * ease),
        briefs: Math.floor(targets.briefs * ease),
        users: Math.floor(targets.users * ease),
      });
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', overflowX: 'hidden' }}>
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radar size={16} color="#fff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Plus Jakarta Sans' }}>IdeaRadar</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/pricing" style={{ fontSize: 14, color: 'var(--text-medium)', textDecoration: 'none', fontWeight: 500 }}>Pricing</Link>
            <Link to="/auth" data-testid="landing-login" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            <Link to="/auth" data-testid="landing-cta-nav"
              style={{ fontSize: 14, fontWeight: 700, padding: '8px 18px', borderRadius: 8, background: '#6366F1', color: '#fff', textDecoration: 'none', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
            >Start free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 0' }}>
        {/* Grid bg */}
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-60%, -40%)', width: 800, height: 800, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          {/* Left: Copy */}
          <div style={{ maxWidth: 640 }}>
            {/* Badge */}
            <div className={`animate-fade-up ${mounted ? '' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8', fontSize: 13, fontWeight: 600, marginBottom: 28 }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s infinite' }} />
              Live pain point discovery across 6 sources
            </div>

            <h1 className="animate-fade-up delay-100" style={{ margin: '0 0 20px', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1, fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.02em' }}>
              The Bloomberg Terminal<br />
              <span className="gradient-text">for Startup Ideas</span>
            </h1>

            <p className="animate-fade-up delay-200" style={{ margin: '0 0 36px', fontSize: 18, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 560 }}>
              AI mines Reddit, Twitter, LinkedIn, App Store reviews, Product Hunt, and Indie Hackers to surface validated pain points — then generates your entire business brief in one click.
            </p>

            <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link to="/auth" data-testid="hero-cta-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, background: '#6366F1', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700, boxShadow: '0 0 30px rgba(99,102,241,0.35)', transition: 'all 0.2s', fontFamily: 'Plus Jakarta Sans' }}
              >Start discovering free<ArrowRight size={16} /></Link>
              <Link to="/pricing"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 10, border: '1px solid var(--border)', color: 'var(--muted)', textDecoration: 'none', fontSize: 15, fontWeight: 600, transition: 'all 0.2s' }}
              >See pricing<ChevronRight size={15} /></Link>
            </div>

            {/* Stats */}
            <div className="animate-fade-up delay-400" style={{ display: 'flex', gap: 32, paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
              {[
                { value: count.ideas.toLocaleString() + '+', label: 'Pain points tracked' },
                { value: count.briefs.toLocaleString() + '+', label: 'Briefs generated' },
                { value: count.users.toLocaleString() + '+', label: 'Founders using IdeaRadar' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 12, color: 'var(--subtle)', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live ticker */}
          <div style={{ height: 520, overflow: 'hidden', maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
            <div className="ticker-track">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => <TickerCard key={i} item={item} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Source logos strip */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-deep)', padding: '20px 24px', marginTop: 0 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 32, overflowX: 'auto' }}>
          <span style={{ fontSize: 12, color: 'var(--subtle)', whiteSpace: 'nowrap', fontWeight: 500 }}>Sources monitored:</span>
          {[
            { key: 'reddit', label: 'Reddit', cls: 'badge-reddit' },
            { key: 'twitter', label: 'Twitter / X', cls: 'badge-twitter' },
            { key: 'linkedin', label: 'LinkedIn', cls: 'badge-linkedin' },
            { key: 'appstore', label: 'App Store', cls: 'badge-appstore' },
            { key: 'producthunt', label: 'Product Hunt', cls: 'badge-producthunt' },
            { key: 'indiehackers', label: 'Indie Hackers', cls: 'badge-indiehackers' },
          ].map(({ key, label, cls }) => (
            <span key={key} className={`badge ${cls}`} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, border: '1px solid', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
          ))}
        </div>
      </div>

      {/* Demo card */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }}>Every idea comes with everything you need to build</h2>
            <p style={{ margin: 0, fontSize: 16, color: 'var(--text-medium)' }}>Not just ideas — validated opportunities with full business context</p>
          </div>

          {/* Example idea detail */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 0 80px rgba(99,102,241,0.08)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-dim)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-linkedin" style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, border: '1px solid', fontWeight: 600 }}>LinkedIn</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, border: '1px solid #EF444444', background: '#EF444411', color: '#EF4444', fontWeight: 600 }}>SEVERE PAIN</span>
              </div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--subtle)' }}>Validated 14 hours ago</div>
            </div>
            <div style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 800, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>AI Video Interview Pre-Screener for SMBs</h3>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>Mid-market companies spending 40+ hours/week reviewing recorded video interviews. Enterprise tools cost $25K–$50K/year. Zero affordable AI screeners for 100–500 person teams.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 0 }}>
                {[
                  { label: 'Opportunity', score: 91 },
                  { label: 'Market', score: 93 },
                  { label: 'Competition Gap', score: 82 },
                  { label: 'Revenue', score: 94 },
                ].map(({ label, score }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '16px', background: 'var(--surface-deep)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                    <OpportunityRing score={score} size={60} strokeWidth={5} />
                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-medium)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-deep)', display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 15, fontWeight: 800, color: '#22C55E' }}>$4.3B</div>
                <div style={{ fontSize: 11, color: 'var(--subtle)' }}>Total Addressable Market</div>
              </div>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 15, fontWeight: 800, color: '#F59E0B' }}>$100K–$500K</div>
                <div style={{ fontSize: 11, color: 'var(--subtle)' }}>Monthly Revenue Potential</div>
              </div>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 15, fontWeight: 800, color: '#818CF8' }}>3,201</div>
                <div style={{ fontSize: 11, color: 'var(--subtle)' }}>Source Validation Votes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }}>From raw complaint to validated business — in minutes</h2>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--text-medium)' }}>The entire ideation pipeline, automated</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {FEATURES.map(({ icon, title, desc, stat }) => (
              <div key={title} className="card card-hover" style={{ padding: '24px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-hi)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{stat}</div>
                <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-medium)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }}>Founders are finding their next big idea here</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {TESTIMONIALS.map(({ text, name, title, product }) => (
              <div key={name} className="card" style={{ padding: '24px' }}>
                <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, fontStyle: 'italic' }}>"{text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                    {name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{name}</div>
                    <div style={{ fontSize: 12, color: 'var(--subtle)' }}>{title} · {product}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ padding: '48px 40px', borderRadius: 16, background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.05) 100%)', border: '1px solid rgba(99,102,241,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <Radar size={36} color="#818CF8" style={{ marginBottom: 16 }} />
            <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }}>Ready to find your next big idea?</h2>
            <p style={{ margin: '0 0 28px', fontSize: 15, color: 'var(--muted)' }}>Join 1,800+ founders using IdeaRadar to find validated opportunities. First business brief is free.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/auth" data-testid="footer-cta-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, background: '#6366F1', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700, boxShadow: '0 0 30px rgba(99,102,241,0.4)', fontFamily: 'Plus Jakarta Sans' }}
              >Start discovering free<ArrowRight size={16} /></Link>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20 }}>
              {['No credit card', 'Free brief included', 'Cancel anytime'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--subtle)' }}>
                  <CheckCircle size={12} color="#22C55E" />{t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radar size={11} color="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--subtle)', fontFamily: 'Plus Jakarta Sans' }}>IdeaRadar</span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--subtle)' }}>The Bloomberg Terminal for startup ideas. Built for founders who are serious.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

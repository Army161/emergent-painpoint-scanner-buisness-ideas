import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, Radar, ArrowLeft, Crown } from 'lucide-react';
import { apiClient, useAuth } from '../App';
import Navbar from './Navbar';
import { toast } from 'sonner';

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    icon: <Radar size={18} />,
    iconColor: 'var(--text-medium)',
    price: '0',
    period: '/forever',
    desc: 'Perfect for exploring what\'s possible',
    features: [
      'Browse all 15+ pain points',
      '1 AI business brief (lifetime)',
      'Opportunity scores & metrics',
      'Source filter & search',
    ],
    accent: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: <Zap size={18} />,
    iconColor: '#818CF8',
    price: '40',
    period: '/month',
    desc: 'For founders who are serious about finding ideas',
    badge: 'POPULAR',
    features: [
      'Everything in Free',
      'Unlimited AI business briefs',
      'Unlimited landing page copy',
      'Priority idea updates',
      'Export briefs as PDF (soon)',
    ],
    accent: true,
  },
  {
    id: 'business',
    name: 'Business',
    icon: <Crown size={18} />,
    iconColor: '#F59E0B',
    price: '60',
    period: '/month',
    desc: 'For teams and power users who want it all',
    badge: 'BEST VALUE',
    features: [
      'Everything in Pro',
      'Early access to new sources',
      '"Scan Any Topic" AI research (soon)',
      'Team sharing & collaboration (soon)',
      'API access (soon)',
      'Priority support',
    ],
    accent: false,
  },
];

const FAQ = [
  { q: 'What does "1 free brief" mean?', a: 'On the free plan, you can generate one AI business brief for any idea. It includes full market analysis, ICP, revenue model, and 90-day launch plan. After that, upgrade to Pro or Business for unlimited generation.' },
  { q: 'Where does the pain point data come from?', a: 'We monitor Reddit, Twitter/X, App Store reviews, LinkedIn job posts, Product Hunt comments, and Indie Hackers forums. Each pain point is validated by community votes and engagement.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. No contracts, no lock-ins. Cancel from your settings with one click, and you keep access until the end of your billing period.' },
  { q: 'What\'s the difference between Pro and Business?', a: 'Pro gives you unlimited AI generation. Business adds team features, API access, priority support, and early access to new data sources and features like "Scan Any Topic".' },
];

const Pricing = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();

  const handleUpgrade = async (tier) => {
    if (!user) { navigate('/auth'); return; }
    if (user.is_premium && user.tier === tier) { toast.success('You\'re already on this plan!'); return; }
    setLoading(tier);
    try {
      const originUrl = window.location.origin;
      const res = await apiClient.post('/subscription/checkout', { tier, origin_url: originUrl });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const getUserTier = () => {
    if (!user) return null;
    if (!user.is_premium) return 'free';
    return user.tier || 'pro';
  };

  const currentTier = getUserTier();

  const getButtonState = (tierId) => {
    if (!user) return { label: tierId === 'free' ? 'Get started free' : `Get ${tierId === 'business' ? 'Business' : 'Pro'}`, disabled: false, isLink: tierId === 'free' };
    if (currentTier === tierId) return { label: 'Current Plan', disabled: true, isLink: false };
    if (tierId === 'free') return { label: currentTier !== 'free' ? 'Previous plan' : 'Current plan', disabled: true, isLink: false };
    if (currentTier === 'business' && tierId === 'pro') return { label: 'Included in Business', disabled: true, isLink: false };
    return { label: `Upgrade to ${tierId === 'business' ? 'Business' : 'Pro'}`, disabled: false, isLink: false };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>
        <Link to={user ? '/dashboard' : '/'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-medium)', textDecoration: 'none', fontSize: 14, marginBottom: 40 }}>
          <ArrowLeft size={14} />Back
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            <Zap size={13} />Simple Pricing
          </div>
          <h1 data-testid="pricing-heading" style={{ margin: '0 0 12px', fontSize: 40, fontWeight: 800, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>Find the plan that's right for you</h1>
          <p style={{ margin: 0, fontSize: 16, color: 'var(--text-medium)' }}>Start free. Upgrade when you're ready to go all in.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {TIERS.map((tier) => {
            const btn = getButtonState(tier.id);
            const isHighlighted = tier.accent;

            return (
              <div key={tier.id} style={{ position: 'relative' }}>
                {isHighlighted && (
                  <div style={{ position: 'absolute', top: -1, left: -1, right: -1, bottom: -1, borderRadius: 13, background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.5))', zIndex: 0 }} />
                )}
                <div className="card" data-testid={`pricing-card-${tier.id}`}
                  style={{ padding: '32px', position: 'relative', zIndex: 1, background: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ color: tier.iconColor }}>{tier.icon}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>{tier.name}</span>
                      {tier.badge && (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: tier.id === 'pro' ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.15)', color: tier.id === 'pro' ? '#818CF8' : '#F59E0B', border: `1px solid ${tier.id === 'pro' ? 'rgba(99,102,241,0.3)' : 'rgba(245,158,11,0.3)'}`, fontWeight: 700 }}>
                          {tier.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                      <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>${tier.price}</span>
                      <span style={{ fontSize: 14, color: 'var(--subtle)' }}>{tier.period}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-medium)' }}>{tier.desc}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, flex: 1 }}>
                    {tier.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <Check size={15} color={tier.id === 'business' ? '#F59E0B' : tier.id === 'pro' ? '#818CF8' : '#22C55E'} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {btn.isLink ? (
                    <Link to="/auth" data-testid={`cta-${tier.id}`}
                      style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--muted)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
                    >{btn.label}</Link>
                  ) : (
                    <button data-testid={`cta-${tier.id}`}
                      onClick={() => !btn.disabled && handleUpgrade(tier.id)}
                      disabled={btn.disabled || loading === tier.id}
                      style={{
                        width: '100%', padding: '13px', borderRadius: 8, border: 'none', fontSize: 15, fontWeight: 700, fontFamily: 'Plus Jakarta Sans', cursor: btn.disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                        background: btn.disabled ? 'var(--surface-hi)' : isHighlighted ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : tier.id === 'business' ? 'linear-gradient(135deg,#F59E0B,#D97706)' : 'var(--surface-hi)',
                        color: btn.disabled ? 'var(--subtle)' : (isHighlighted || tier.id === 'business') ? '#fff' : 'var(--text)',
                        boxShadow: btn.disabled ? 'none' : isHighlighted ? '0 0 24px rgba(99,102,241,0.35)' : tier.id === 'business' ? '0 0 24px rgba(245,158,11,0.25)' : 'none',
                        border: btn.disabled || isHighlighted || tier.id === 'business' ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      {loading === tier.id ? 'Processing...' : btn.label}
                    </button>
                  )}
                  {(tier.id === 'pro' || tier.id === 'business') && (
                    <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 12, color: 'var(--subtle)' }}>Cancel anytime. No contracts.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 60, padding: '32px', borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--surface-dim)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>Common questions</h3>
          {FAQ.map(({ q, a }) => (
            <div key={q} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
              <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{q}</p>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-medium)', lineHeight: 1.6 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;

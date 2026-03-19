import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, Radar, ArrowLeft } from 'lucide-react';
import { apiClient, useAuth } from '../App';
import Navbar from './Navbar';
import { toast } from 'sonner';

const FEATURES_FREE = ['Browse all 15+ pain points', '1 AI business brief (lifetime)', 'Opportunity scores & metrics', 'Source filter & search'];
const FEATURES_PRO = ['Everything in Free', 'Unlimited AI business briefs', 'Unlimited landing page copy', 'Priority idea updates', 'Early access to new sources', 'Export briefs as PDF (soon)'];

const Pricing = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (!user) { navigate('/auth'); return; }
    if (user.is_premium) { toast.success('You\'re already on Pro!'); return; }
    setLoading(true);
    try {
      await apiClient.post('/subscription/upgrade');
      setUser(u => ({ ...u, is_premium: true }));
      toast.success('Welcome to IdeaRadar Pro! Unlimited access unlocked.');
      navigate('/dashboard');
    } catch { toast.error('Upgrade failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030303' }}>
      <Navbar />
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Back */}
        <Link to={user ? '/dashboard' : '/'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#71717A', textDecoration: 'none', fontSize: 14, marginBottom: 40 }}>
          <ArrowLeft size={14} />Back
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            <Zap size={13} />Simple Pricing
          </div>
          <h1 style={{ margin: '0 0 12px', fontSize: 40, fontWeight: 800, color: '#FAFAFA', fontFamily: 'Plus Jakarta Sans' }}>Find the plan that's right for you</h1>
          <p style={{ margin: 0, fontSize: 16, color: '#71717A' }}>Start free. Upgrade when you're ready to go all in.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Free */}
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Radar size={18} color="#71717A" />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#FAFAFA', fontFamily: 'Plus Jakarta Sans' }}>Free</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: '#FAFAFA', fontFamily: 'Plus Jakarta Sans' }}>$0</span>
                <span style={{ fontSize: 14, color: '#52525B' }}>/forever</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#71717A' }}>Perfect for exploring what's possible</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {FEATURES_FREE.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Check size={15} color="#22C55E" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 14, color: '#A1A1AA' }}>{f}</span>
                </div>
              ))}
            </div>
            {user ? (
              <div style={{ padding: '12px', borderRadius: 8, border: '1px solid #27272A', textAlign: 'center', color: '#52525B', fontSize: 14 }}>
                {user.is_premium ? 'Your current plan' : 'Current plan'}
              </div>
            ) : (
              <Link to="/auth" data-testid="free-cta"
                style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 8, border: '1px solid #27272A', color: '#A1A1AA', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
              >Get started free</Link>
            )}
          </div>

          {/* Pro */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: -1, left: -1, right: -1, bottom: -1, borderRadius: 13, background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.5))', zIndex: 0 }} />
            <div className="card" style={{ padding: '32px', position: 'relative', zIndex: 1, background: '#0A0A0A' }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Zap size={18} color="#818CF8" />
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#FAFAFA', fontFamily: 'Plus Jakarta Sans' }}>Pro</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(99,102,241,0.2)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)', fontWeight: 700 }}>POPULAR</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: '#FAFAFA', fontFamily: 'Plus Jakarta Sans' }}>$29</span>
                  <span style={{ fontSize: 14, color: '#52525B' }}>/month</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#71717A' }}>For founders who are serious about finding the right idea</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {FEATURES_PRO.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Check size={15} color="#818CF8" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 14, color: '#A1A1AA' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button data-testid="upgrade-btn" onClick={handleUpgrade} disabled={loading || user?.is_premium}
                style={{ width: '100%', padding: '13px', borderRadius: 8, border: 'none', background: user?.is_premium ? '#27272A' : 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading || user?.is_premium ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: user?.is_premium ? 'none' : '0 0 24px rgba(99,102,241,0.35)', fontFamily: 'Plus Jakarta Sans' }}
              >
                {loading ? 'Processing...' : user?.is_premium ? 'Current Plan' : user ? 'Upgrade to Pro' : 'Get Pro Access'}
              </button>
              <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 12, color: '#52525B' }}>Cancel anytime. No contracts.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 60, padding: '32px', borderRadius: 12, border: '1px solid #18181B', background: '#070707' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#FAFAFA', fontFamily: 'Plus Jakarta Sans' }}>Common questions</h3>
          {[
            { q: 'What does "1 free brief" mean?', a: 'On the free plan, you can generate one AI business brief for any idea. It includes full market analysis, ICP, revenue model, and 90-day launch plan. After that, upgrade to Pro for unlimited generation.' },
            { q: 'Where does the pain point data come from?', a: 'We monitor Reddit, Twitter/X, App Store reviews, LinkedIn job posts, Product Hunt comments, and Indie Hackers forums. Each pain point is validated by community votes and engagement.' },
            { q: 'Can I cancel my Pro plan anytime?', a: 'Absolutely. No contracts, no lock-ins. Cancel from your settings with one click, and you keep Pro access until the end of your billing period.' },
          ].map(({ q, a }) => (
            <div key={q} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #111' }}>
              <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>{q}</p>
              <p style={{ margin: 0, fontSize: 14, color: '#71717A', lineHeight: 1.6 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;

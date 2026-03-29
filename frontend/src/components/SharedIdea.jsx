import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Radar, TrendingUp, DollarSign, Users, Target, ArrowLeft, Zap } from 'lucide-react';
import OpportunityRing from './OpportunityRing';

const API = process.env.REACT_APP_BACKEND_URL;

const SharedIdea = () => {
  const { shareId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/shared/${shareId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="shimmer" style={{ width: 300, height: 40, borderRadius: 8 }} />
    </div>
  );

  if (error || !data) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ color: 'var(--text-medium)', fontSize: 16 }}>This shared idea was not found or has been removed.</p>
      <Link to="/" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 600 }}>Go to PainSignal</Link>
    </div>
  );

  const idea = data.idea;
  const metrics = [
    { label: 'Opportunity', score: idea.opportunity_score, icon: <TrendingUp size={14} />, color: '#6366F1' },
    { label: 'Market', score: idea.market_score, icon: <Users size={14} />, color: '#22C55E' },
    { label: 'Competition', score: idea.competition_score, icon: <Target size={14} />, color: '#F59E0B' },
    { label: 'Revenue', score: idea.revenue_score, icon: <DollarSign size={14} />, color: '#EF4444' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mini nav */}
      <nav style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radar size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>PainSignal</span>
        </div>
        <Link to="/auth" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#6366F1', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
          <Zap size={13} />Sign Up Free
        </Link>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--subtle)' }}>Shared on {new Date(data.shared_at).toLocaleDateString()}</div>

        <h1 data-testid="shared-idea-title" style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>{idea.title}</h1>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: 'var(--muted)', lineHeight: 1.7 }}>{idea.description}</p>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {metrics.map(m => (
            <div key={m.label} className="card" style={{ padding: 16, textAlign: 'center' }}>
              <OpportunityRing score={m.score} size={64} color={m.color} label="" />
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-medium)', fontWeight: 600 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><span style={{ fontSize: 12, color: 'var(--subtle)' }}>Category</span><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>{idea.category}</div></div>
            <div><span style={{ fontSize: 12, color: 'var(--subtle)' }}>Revenue Potential</span><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>{idea.revenue_estimate}</div></div>
            <div><span style={{ fontSize: 12, color: 'var(--subtle)' }}>Market Size</span><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>{idea.market_size}</div></div>
            <div><span style={{ fontSize: 12, color: 'var(--subtle)' }}>Pain Level</span><div style={{ fontSize: 14, fontWeight: 600, color: idea.pain_intensity === 'severe' ? '#EF4444' : '#F59E0B', marginTop: 4, textTransform: 'uppercase' }}>{idea.pain_intensity}</div></div>
          </div>
        </div>

        {idea.pain_quote && (
          <div className="card" style={{ padding: 20, borderLeft: '3px solid #6366F1', marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.6 }}>"{idea.pain_quote}"</p>
          </div>
        )}

        {idea.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
            {idea.tags.map(t => (
              <span key={t} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'var(--surface-hi)', color: 'var(--text-medium)', border: '1px solid var(--border)' }}>{t}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="card" style={{ padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>Want the full business brief?</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--muted)' }}>Sign up for PainSignal to generate AI-powered business briefs, landing page copy, and discover more opportunities.</p>
          <Link to="/auth" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 28px', borderRadius: 10, background: '#6366F1', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700, boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
            <Zap size={15} />Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedIdea;

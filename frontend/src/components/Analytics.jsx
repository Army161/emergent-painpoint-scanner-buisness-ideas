import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, FileText, Bookmark, Sparkles, CreditCard, ArrowLeft, Crown, Zap } from 'lucide-react';
import { apiClient, useAuth } from '../App';
import Navbar from './Navbar';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}
    style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {React.cloneElement(icon, { size: 20, color })}
    </div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-medium)' }}>{label}</div>
    </div>
  </div>
);

const Analytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/user/analytics').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const tierLabel = data?.tier === 'business' ? 'Business' : data?.tier === 'pro' ? 'Pro' : 'Free';
  const tierColor = data?.tier === 'business' ? '#F59E0B' : data?.tier === 'pro' ? '#818CF8' : '#22C55E';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-medium)', textDecoration: 'none', fontSize: 14, marginBottom: 28 }}>
          <ArrowLeft size={14} />Back to Feed
        </Link>

        <div style={{ marginBottom: 28 }}>
          <h1 data-testid="analytics-heading" style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>Your Dashboard</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-medium)' }}>Track your research activity and account usage.</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="shimmer" style={{ height: 84, borderRadius: 12 }} />)}
          </div>
        ) : data ? (
          <>
            {/* Tier Badge */}
            <div className="card" style={{ padding: '16px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {data.tier === 'business' ? <Crown size={18} color={tierColor} /> : data.tier === 'pro' ? <Zap size={18} color={tierColor} /> : <BarChart3 size={18} color={tierColor} />}
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>
                  {user?.name || user?.email}
                </span>
                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: `${tierColor}18`, color: tierColor, fontWeight: 700, border: `1px solid ${tierColor}30` }}>
                  {tierLabel}
                </span>
              </div>
              {!data.is_premium && (
                <Link to="/pricing" style={{ fontSize: 13, color: '#818CF8', textDecoration: 'none', fontWeight: 600 }}>Upgrade</Link>
              )}
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
              <StatCard icon={<FileText />} label="Briefs Generated" value={data.briefs_generated} color="#6366F1" />
              <StatCard icon={<FileText />} label="Landing Copies" value={data.copies_generated} color="#8B5CF6" />
              <StatCard icon={<Bookmark />} label="Ideas Saved" value={data.ideas_saved} color="#22C55E" />
              <StatCard icon={<Sparkles />} label="Topics Scanned" value={data.topics_scanned} color="#F59E0B" />
              <StatCard icon={<CreditCard />} label="Payments Made" value={data.payments_made} color="#10B981" />
              <StatCard icon={<BarChart3 />} label="Free Briefs Used" value={`${data.free_briefs_used}/1`} color="#EF4444" />
            </div>

            {/* Recent Briefs */}
            {data.recent_briefs?.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>Recent Briefs</h3>
                {data.recent_briefs.map((b, i) => (
                  <Link key={i} to={`/idea/${b.idea_id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < data.recent_briefs.length - 1 ? '1px solid var(--border-subtle)' : 'none', textDecoration: 'none' }}>
                    <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{b.title}</span>
                    <span style={{ fontSize: 12, color: 'var(--subtle)' }}>{b.updated_at ? new Date(b.updated_at).toLocaleDateString() : ''}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <p style={{ color: 'var(--text-medium)' }}>Failed to load analytics.</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;

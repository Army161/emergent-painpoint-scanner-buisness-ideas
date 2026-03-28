import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, ArrowUp, TrendingUp } from 'lucide-react';
import OpportunityRing from './OpportunityRing';
import { apiClient } from '../App';
import { toast } from 'sonner';

const SOURCE_LABELS = {
  reddit: { label: 'Reddit', cls: 'badge-reddit' },
  twitter: { label: 'Twitter / X', cls: 'badge-twitter' },
  linkedin: { label: 'LinkedIn', cls: 'badge-linkedin' },
  appstore: { label: 'App Store', cls: 'badge-appstore' },
  producthunt: { label: 'Product Hunt', cls: 'badge-producthunt' },
  indiehackers: { label: 'Indie Hackers', cls: 'badge-indiehackers' },
  ai_scan: { label: 'AI Scan', cls: 'badge-ai_scan' },
};

const IdeaCard = ({ idea, onSaveToggle }) => {
  const navigate = useNavigate();
  const src = SOURCE_LABELS[idea.source] || { label: idea.source_display, cls: '' };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      const res = await apiClient.post(`/ideas/${idea.id}/save`);
      toast.success(res.data.saved ? 'Idea saved!' : 'Removed from saved');
      if (onSaveToggle) onSaveToggle(idea.id, res.data.saved);
    } catch (err) {
      if (err.response?.status === 401) toast.error('Sign in to save ideas');
      else toast.error('Something went wrong');
    }
  };

  const painColor = idea.pain_intensity === 'severe' ? '#EF4444' : idea.pain_intensity === 'moderate' ? '#EAB308' : '#22C55E';

  return (
    <div data-testid={`idea-card-${idea.id}`}
      onClick={() => navigate(`/idea/${idea.id}`)}
      className="card card-hover"
      style={{ cursor: 'pointer', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span className={`badge ${src.cls}`} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, border: '1px solid', fontWeight: 600 }}>
              {src.label}
            </span>
            {idea.trending && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#F59E0B', fontWeight: 600 }}>
                <TrendingUp size={10} /> HOT
              </span>
            )}
            {idea.live && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#1DA1F2', fontWeight: 600, background: 'rgba(29,161,242,0.1)', padding: '1px 6px', borderRadius: 99, border: '1px solid rgba(29,161,242,0.2)' }}>
                LIVE
              </span>
            )}
          </div>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'var(--surface-hover)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
            {idea.category}
          </span>
        </div>
        <OpportunityRing score={idea.opportunity_score} size={56} strokeWidth={5} />
      </div>

      {/* Body */}
      <div style={{ padding: '14px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, fontFamily: 'Plus Jakarta Sans' }}>
          {idea.title}
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {idea.description}
        </p>

        {/* Pain indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: painColor, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: painColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {idea.pain_intensity} pain
          </span>
        </div>
      </div>

      {/* Footer metrics */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{idea.market_size}</div>
            <div style={{ fontSize: 10, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Market</div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: '#22C55E' }}>{idea.revenue_estimate}</div>
            <div style={{ fontSize: 10, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Revenue</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button data-testid={`upvote-${idea.id}`} onClick={(e) => { e.stopPropagation(); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 12 }}>
            <ArrowUp size={13} /> {idea.upvotes}
          </button>
          <button data-testid={`save-${idea.id}`} onClick={handleSave}
            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: idea.is_saved ? 'rgba(99,102,241,0.15)' : 'transparent', color: idea.is_saved ? '#818CF8' : 'var(--muted)', cursor: 'pointer' }}
          >
            <Bookmark size={13} fill={idea.is_saved ? '#818CF8' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;

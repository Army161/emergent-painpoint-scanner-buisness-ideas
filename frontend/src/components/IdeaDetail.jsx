import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bookmark, ArrowUp, Zap, FileText, Copy, Check, ChevronRight, TrendingUp, Users, DollarSign, Target, Download } from 'lucide-react';
import { apiClient, useAuth } from '../App';
import Navbar from './Navbar';
import OpportunityRing from './OpportunityRing';
import { toast } from 'sonner';

const SOURCE_CLS = {
  reddit: 'badge-reddit', twitter: 'badge-twitter', linkedin: 'badge-linkedin',
  appstore: 'badge-appstore', producthunt: 'badge-producthunt', indiehackers: 'badge-indiehackers',
  ai_scan: 'badge-ai_scan'
};

const TypewriterContent = ({ text }) => {
  const [displayed, setDisplayed] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!text) return;
    setDisplayed('');
    let i = 0;
    intervalRef.current = setInterval(() => {
      i += 12;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(intervalRef.current);
    }, 16);
    return () => clearInterval(intervalRef.current);
  }, [text]);

  const lines = displayed.split('\n');
  return (
    <div style={{ fontFamily: 'Inter', lineHeight: 1.75, color: 'var(--muted)' }}>
      {lines.map((line, idx) => {
        if (line.startsWith('## ')) return <h2 key={idx} style={{ margin: '20px 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>{line.slice(3)}</h2>;
        if (line.startsWith('**') && line.endsWith('**')) return <p key={idx} style={{ margin: '8px 0 4px', fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{line.slice(2, -2)}</p>;
        if (line.startsWith('- ')) return <li key={idx} style={{ marginLeft: 16, marginBottom: 4, fontSize: 14 }}>{line.slice(2)}</li>;
        if (line.trim() === '') return <div key={idx} style={{ height: 8 }} />;
        return <p key={idx} style={{ margin: '4px 0', fontSize: 14 }}>{line}</p>;
      })}
      {displayed.length < (text?.length || 0) && <span className="cursor" />}
    </div>
  );
};

const IdeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('brief');
  const [generating, setGenerating] = useState({ brief: false, copy: false });
  const [brief, setBrief] = useState(null);
  const [copy, setCopy] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient.get(`/ideas/${id}`).then(res => {
      setIdea(res.data);
      setSaved(res.data.is_saved);
      if (res.data.brief) setBrief(res.data.brief);
      if (res.data.landing_copy) setCopy(res.data.landing_copy);
    }).catch(() => toast.error('Idea not found')).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      const res = await apiClient.post(`/ideas/${idea.id}/save`);
      setSaved(res.data.saved);
      toast.success(res.data.saved ? 'Idea saved!' : 'Removed from saved');
    } catch { toast.error('Please sign in first'); }
  };

  const generateBrief = async () => {
    setGenerating(g => ({ ...g, brief: true }));
    setActiveTab('brief');
    try {
      const res = await apiClient.post(`/ideas/${idea.id}/brief`);
      setBrief(res.data.brief);
      toast.success('Business brief generated!');
    } catch (err) {
      if (err.response?.status === 402) {
        toast.error('Upgrade to Pro to generate more briefs');
        navigate('/pricing');
      } else {
        toast.error('Generation failed. Please try again.');
      }
    } finally {
      setGenerating(g => ({ ...g, brief: false }));
    }
  };

  const generateCopy = async () => {
    setGenerating(g => ({ ...g, copy: true }));
    setActiveTab('copy');
    try {
      const res = await apiClient.post(`/ideas/${idea.id}/landing-copy`);
      setCopy(res.data.landing_copy);
      toast.success('Landing page copy generated!');
    } catch (err) {
      if (err.response?.status === 402) {
        toast.error('Upgrade to Pro to generate more content');
        navigate('/pricing');
      } else {
        toast.error('Generation failed. Please try again.');
      }
    } finally {
      setGenerating(g => ({ ...g, copy: false }));
    }
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {[...Array(3)].map((_, i) => <div key={i} className="shimmer" style={{ height: 80, borderRadius: 10, marginBottom: 12 }} />)}
      </div>
    </div>
  );

  if (!idea) return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-medium)' }}>Idea not found</div>;

  const painColor = idea.pain_intensity === 'severe' ? '#EF4444' : idea.pain_intensity === 'moderate' ? '#EAB308' : '#22C55E';
  const srcCls = SOURCE_CLS[idea.source] || '';
  const currentContent = activeTab === 'brief' ? brief : copy;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 60px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: 'var(--subtle)' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-medium)', textDecoration: 'none' }}>
            <ArrowLeft size={14} />Discover
          </Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--muted)' }}>{idea.title}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          {/* Main column */}
          <div>
            {/* Header */}
            <div className="card" style={{ padding: '28px 28px 24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span className={`badge ${srcCls}`} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, border: '1px solid', fontWeight: 600 }}>{idea.source_display}</span>
                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, border: '1px solid var(--border)', color: 'var(--muted)' }}>{idea.category}</span>
                {idea.trending && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#F59E0B', fontWeight: 600 }}><TrendingUp size={12} />Trending</span>}
                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, border: `1px solid ${painColor}22`, color: painColor, background: `${painColor}11`, fontWeight: 600 }}>
                  {idea.pain_intensity.toUpperCase()} PAIN
                </span>
              </div>
              <h1 style={{ margin: '0 0 16px', fontSize: 26, fontWeight: 800, color: 'var(--text)', lineHeight: 1.3, fontFamily: 'Plus Jakarta Sans' }}>{idea.title}</h1>
              <p style={{ margin: 0, fontSize: 15, color: 'var(--muted)', lineHeight: 1.7 }}>{idea.description}</p>

              {/* Quote */}
              {idea.pain_quote && (
                <blockquote style={{ margin: '20px 0 0', padding: '14px 18px', borderLeft: `3px solid ${painColor}`, background: `${painColor}08`, borderRadius: '0 8px 8px 0' }}>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, fontStyle: 'italic' }}>{idea.pain_quote}</p>
                </blockquote>
              )}
            </div>

            {/* Score metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Opportunity', score: idea.opportunity_score, icon: <Target size={14} /> },
                { label: 'Market Size', score: idea.market_score, icon: <Users size={14} /> },
                { label: 'Competition Gap', score: idea.competition_score, icon: <TrendingUp size={14} /> },
                { label: 'Revenue Potential', score: idea.revenue_score, icon: <DollarSign size={14} /> },
              ].map(({ label, score, icon }) => (
                <div key={label} className="card" style={{ padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                    <OpportunityRing score={score} size={64} strokeWidth={5} label={label} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8, color: 'var(--text-medium)', fontSize: 11 }}>
                    {icon}<span>{label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Competition analysis */}
            <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>Competition Gap Analysis</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{idea.competition_analysis}</p>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {(idea.tags || []).map(tag => (
                <span key={tag} style={{ padding: '4px 12px', borderRadius: 99, border: '1px solid var(--border)', color: 'var(--text-medium)', fontSize: 12 }}>{tag}</span>
              ))}
            </div>

            {/* AI Content */}
            {(brief || copy) && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-dim)' }}>
                  {[
                    { key: 'brief', label: 'Business Brief', icon: <FileText size={14} />, available: !!brief },
                    { key: 'copy', label: 'Landing Page Copy', icon: <Zap size={14} />, available: !!copy },
                  ].map(({ key, label, icon, available }) => available && (
                    <button key={key} data-testid={`tab-${key}`} onClick={() => setActiveTab(key)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 20px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: activeTab === key ? 'transparent' : 'transparent',
                        color: activeTab === key ? 'var(--text)' : 'var(--subtle)',
                        borderBottom: activeTab === key ? '2px solid #6366F1' : '2px solid transparent',
                        transition: 'all 0.2s'
                      }}
                    >{icon}{label}</button>
                  ))}
                  <button onClick={() => copyToClipboard(currentContent)} data-testid="copy-btn"
                    style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '14px 20px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-medium)', fontSize: 13 }}
                  >{copied ? <Check size={14} color="#22C55E" /> : <Copy size={14} />}{copied ? 'Copied!' : 'Copy'}</button>
                </div>
                <div style={{ padding: '24px 28px' }}>
                  <TypewriterContent text={currentContent} key={activeTab + (currentContent || '')} />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: 80 }}>
            {/* Metrics card */}
            <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Market Metrics</h3>
              {[
                { label: 'Total Addressable Market', value: idea.market_size, color: 'var(--text)' },
                { label: 'Revenue Potential', value: idea.revenue_estimate, color: '#22C55E' },
                { label: 'Source Validation', value: `${idea.votes_on_source?.toLocaleString()} votes`, color: '#818CF8' },
                { label: 'Community Upvotes', value: idea.upvotes?.toLocaleString(), color: '#F59E0B' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-medium)' }}>{label}</span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button data-testid="generate-brief-btn" onClick={generateBrief} disabled={generating.brief}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 10, border: 'none', background: generating.brief ? 'var(--border-hi)' : '#6366F1', color: '#fff', fontSize: 14, fontWeight: 700, cursor: generating.brief ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 0 20px rgba(99,102,241,0.25)', fontFamily: 'Plus Jakarta Sans' }}
              >
                <FileText size={16} />
                {generating.brief ? 'Generating...' : brief ? 'Regenerate Brief' : 'Generate Business Brief'}
              </button>
              <button data-testid="generate-copy-btn" onClick={generateCopy} disabled={generating.copy}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 10, border: '1px solid var(--border-hi)', background: 'transparent', color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: generating.copy ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: 'Plus Jakarta Sans' }}
              >
                <Zap size={16} />
                {generating.copy ? 'Generating...' : copy ? 'Regenerate Copy' : 'Generate Landing Copy'}
              </button>
              <button data-testid="save-idea-btn" onClick={handleSave}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 10, border: `1px solid ${saved ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`, background: saved ? 'rgba(99,102,241,0.1)' : 'transparent', color: saved ? '#818CF8' : 'var(--muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Bookmark size={16} fill={saved ? '#818CF8' : 'none'} />
                {saved ? 'Saved' : 'Save Idea'}
              </button>
              {brief && user?.is_premium && (
                <button data-testid="export-pdf-btn" onClick={() => {
                  const API = process.env.REACT_APP_BACKEND_URL;
                  const token = localStorage.getItem('painsignal_token');
                  window.open(`${API}/api/ideas/${id}/export-pdf?token=${token}`, '_blank');
                }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 10, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', color: '#22C55E', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <Download size={16} />Export as PDF
                </button>
              )}
            </div>

            {!user?.is_premium && (
              <div style={{ marginTop: 16, padding: '16px', borderRadius: 10, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                  {user?.free_briefs_used >= 1 ? 'Unlock Unlimited Access' : '1 free brief included'}
                </p>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                  {user?.free_briefs_used >= 1 ? 'You\'ve used your free brief. Upgrade to Pro for unlimited briefs, landing copies, and more.' : 'Generate your first brief for free. Upgrade for unlimited access.'}
                </p>
                <Link to="/pricing" style={{ display: 'block', textAlign: 'center', padding: '9px', borderRadius: 8, background: '#6366F1', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                View Plans
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail;

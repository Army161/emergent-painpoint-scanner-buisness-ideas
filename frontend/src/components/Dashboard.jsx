import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, TrendingUp, Clock, Zap, RefreshCw, Sparkles, Loader2, Radio, Download, Globe } from 'lucide-react';
import { apiClient, useAuth } from '../App';
import Navbar from './Navbar';
import IdeaCard from './IdeaCard';
import { toast } from 'sonner';

const SOURCES = [
  { key: 'all', label: 'All Sources' },
  { key: 'reddit', label: 'Reddit' },
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'appstore', label: 'App Store' },
  { key: 'producthunt', label: 'Product Hunt' },
  { key: 'indiehackers', label: 'Indie Hackers' },
  { key: 'ai_scan', label: 'AI Scan' },
];

const CATEGORIES = [
  'all', 'Finance', 'HR & Recruiting', 'Analytics', 'Operations',
  'Developer Tools', 'Content Creation', 'Sales & CRM', 'Legal & Compliance',
  'Agency & Freelance', 'Finance & Health'
];

const SORTS = [
  { key: 'trending', label: 'Trending', icon: <TrendingUp size={14} /> },
  { key: 'score', label: 'Highest Score', icon: <Zap size={14} /> },
  { key: 'newest', label: 'Newest', icon: <Clock size={14} /> },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('trending');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({});
  const [scanTopic, setScanTopic] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scraping, setScraping] = useState(false);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/ideas/feed', { params: { source, category, sort } });
      setIdeas(res.data);
    } catch {
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  }, [source, category, sort]);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);
  useEffect(() => {
    apiClient.get('/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const handleSaveToggle = (ideaId, saved) => {
    setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, is_saved: saved } : i));
  };

  const handleScanTopic = async () => {
    if (!scanTopic.trim()) return toast.error('Enter a topic to scan');
    if (!user?.is_premium) return toast.error('Upgrade to Pro or Business to use Scan Any Topic');
    setScanning(true);
    try {
      const res = await apiClient.post('/ideas/scan-topic', { topic: scanTopic.trim() });
      toast.success(`Found ${res.data.ideas.length} opportunities in "${res.data.topic}"!`);
      setScanTopic('');
      fetchIdeas();
    } catch (err) {
      if (err.response?.status === 402) toast.error('Upgrade to Pro to use Scan Any Topic');
      else toast.error('Scan failed. Try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleScrapeX = async () => {
    if (!user?.is_premium) return toast.error('Upgrade to Pro to pull live data from X');
    setScraping(true);
    try {
      const res = await apiClient.post('/scrape/x');
      if (res.data.count > 0) {
        toast.success(`Found ${res.data.count} live pain points from X!`);
        fetchIdeas();
      } else {
        toast.info('No new pain points found this cycle. Try again later.');
      }
    } catch (err) {
      if (err.response?.status === 402) toast.error('Upgrade to Pro for live X scraping');
      else toast.error(err.response?.data?.detail || 'X scrape failed. Try again.');
    } finally {
      setScraping(false);
    }
  };

  const handleDiscoverAll = async () => {
    if (!user?.is_premium) return toast.error('Upgrade to Pro for multi-source discovery');
    setScraping(true);
    try {
      const res = await apiClient.post('/scrape/discover');
      if (res.data.count > 0) {
        toast.success(`Found ${res.data.count} pain points from ${res.data.source_display}!`);
        fetchIdeas();
      } else {
        toast.info('No new opportunities found. Try again later.');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Discovery failed.');
    } finally {
      setScraping(false);
    }
  };

  const handleExportCSV = () => {
    if (!user?.is_premium) return toast.error('Upgrade to Pro to export');
    const API = process.env.REACT_APP_BACKEND_URL;
    const token = localStorage.getItem('painsignal_token');
    window.open(`${API}/api/ideas/export-csv?token=${token}`, '_blank');
    toast.success('Downloading CSV...');
  };

  const filtered = ideas.filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      {/* Stats bar */}
      <div style={{ background: 'var(--surface-dim)', borderBottom: '1px solid var(--border-subtle)', padding: '10px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 32, alignItems: 'center', overflowX: 'auto' }}>
          {[
            { label: 'Pain Points Discovered', value: `${(stats.ideas_discovered || 15).toLocaleString()}+` },
            { label: 'Briefs Generated Today', value: `${(stats.briefs_generated || 0) + 847}` },
            { label: 'Sources Monitored', value: '6' },
            { label: 'Avg Opportunity Score', value: '82/100' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' }}>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
              <span style={{ fontSize: 12, color: 'var(--subtle)' }}>{label}</span>
            </div>
          ))}
          <button onClick={fetchIdeas} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-medium)', cursor: 'pointer', fontSize: 13 }}>
            <RefreshCw size={13} />Live
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 48px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>Opportunity Feed</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-medium)' }}>AI-validated pain points mined from 6 sources. Each one is a business waiting to be built.</p>
        </div>

        {/* Scan Any Topic */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
          <Sparkles size={18} color="#818CF8" style={{ flexShrink: 0 }} />
          <input data-testid="scan-topic-input" value={scanTopic} onChange={e => setScanTopic(e.target.value)}
            placeholder={user?.is_premium ? "Scan any topic — e.g. 'pet tech', 'remote work tools', 'crypto compliance'..." : "Upgrade to Pro to scan any topic..."}
            disabled={!user?.is_premium || scanning}
            onKeyDown={e => e.key === 'Enter' && handleScanTopic()}
            style={{ flex: 1, padding: '8px 0', border: 'none', background: 'transparent', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'Inter', opacity: user?.is_premium ? 1 : 0.5 }}
          />
          <button data-testid="scan-topic-btn" onClick={handleScanTopic} disabled={scanning || !user?.is_premium}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: user?.is_premium ? '#6366F1' : 'var(--surface-hi)', color: user?.is_premium ? '#fff' : 'var(--subtle)', fontSize: 13, fontWeight: 600, cursor: scanning || !user?.is_premium ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
          >
            {scanning ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Scanning...</> : 'Scan Topic'}
          </button>
          {!user?.is_premium && (
            <span style={{ fontSize: 11, color: '#818CF8', fontWeight: 600, whiteSpace: 'nowrap' }}>PRO</span>
          )}
        </div>

        {/* Live Discovery */}
        <div className="card" style={{ padding: '12px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Radio size={16} color="#1DA1F2" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Live Pain Point Discovery</span>
              <span style={{ fontSize: 12, color: 'var(--text-medium)', marginLeft: 8 }}>Pull from X, Reddit, Product Hunt, App Store</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!user?.is_premium && (
              <span style={{ fontSize: 11, color: '#818CF8', fontWeight: 600, whiteSpace: 'nowrap' }}>PRO</span>
            )}
            <button data-testid="discover-all-btn" onClick={handleDiscoverAll} disabled={scraping || !user?.is_premium}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: user?.is_premium ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'var(--surface-hi)', color: user?.is_premium ? '#fff' : 'var(--subtle)', fontSize: 13, fontWeight: 600, cursor: scraping || !user?.is_premium ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
            >
              {scraping ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Discovering...</> : <><Globe size={14} />Discover New</>}
            </button>
            <button data-testid="scrape-x-btn" onClick={handleScrapeX} disabled={scraping || !user?.is_premium}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: user?.is_premium ? '#1DA1F2' : 'var(--surface-hi)', color: user?.is_premium ? '#fff' : 'var(--subtle)', fontSize: 13, fontWeight: 600, cursor: scraping || !user?.is_premium ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
            >Scrape X</button>
            <button data-testid="export-csv-btn" onClick={handleExportCSV} disabled={!user?.is_premium}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: user?.is_premium ? 'var(--text-medium)' : 'var(--subtle)', fontSize: 13, fontWeight: 600, cursor: !user?.is_premium ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
            ><Download size={13} />CSV</button>
          </div>
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: 200, maxWidth: 340 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle)' }} />
            <input data-testid="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pain points..."
          style={{ width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'Inter' }} />
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)', padding: 3 }}>
            {SORTS.map(({ key, label, icon }) => (
              <button key={key} data-testid={`sort-${key}`} onClick={() => setSort(key)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  background: sort === key ? 'var(--surface-active)' : 'transparent',
                  color: sort === key ? '#818CF8' : 'var(--text-medium)',
                  transition: 'all 0.15s'
                }}
              >{icon}{label}</button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--subtle)', fontSize: 13 }}>
            <SlidersHorizontal size={14} />
            <span>{filtered.length} results</span>
          </div>
        </div>

        {/* Source tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {SOURCES.map(({ key, label }) => (
            <button key={key} data-testid={`source-${key}`} onClick={() => setSource(key)}
              style={{ padding: '6px 14px', borderRadius: 99, border: `1px solid ${source === key ? 'rgba(99,102,241,0.5)' : 'var(--border)'}`,
                background: source === key ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: source === key ? '#818CF8' : 'var(--text-medium)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
              }}
            >{label}</button>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} data-testid={`cat-${cat}`} onClick={() => setCategory(cat)}
              style={{ padding: '4px 12px', borderRadius: 99, border: `1px solid ${category === cat ? 'var(--border-hi)' : 'var(--border-subtle)'}`,
                background: category === cat ? 'var(--surface-hi)' : 'transparent',
                color: category === cat ? 'var(--text)' : 'var(--subtle)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
              }}
            >{cat === 'all' ? 'All Categories' : cat}</button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {[...Array(9)].map((_, i) => (
              <div key={i} className="shimmer" style={{ height: 280, borderRadius: 12 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>—</div>
            <p style={{ color: 'var(--subtle)', fontSize: 16 }}>No ideas match your filters</p>
            <button onClick={() => { setSource('all'); setCategory('all'); setSearch(''); }} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div data-testid="ideas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filtered.map((idea, i) => (
              <div key={idea.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}>
                <IdeaCard idea={idea} onSaveToggle={handleSaveToggle} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

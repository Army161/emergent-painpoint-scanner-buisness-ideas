import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkX } from 'lucide-react';
import { apiClient } from '../App';
import Navbar from './Navbar';
import IdeaCard from './IdeaCard';
import { toast } from 'sonner';

const SavedIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/ideas/user/saved').then(res => setIdeas(res.data)).catch(() => toast.error('Failed to load saved ideas')).finally(() => setLoading(false));
  }, []);

  const handleSaveToggle = (ideaId, saved) => {
    if (!saved) setIdeas(prev => prev.filter(i => i.id !== ideaId));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 60px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>Saved Ideas</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-medium)' }}>{ideas.length} idea{ideas.length !== 1 ? 's' : ''} in your library</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {[...Array(3)].map((_, i) => <div key={i} className="shimmer" style={{ height: 280, borderRadius: 12 }} />)}
          </div>
        ) : ideas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <BookmarkX size={40} color="#3F3F46" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--text-medium)', fontFamily: 'Plus Jakarta Sans' }}>No saved ideas yet</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--subtle)' }}>Browse the feed and save ideas that excite you</p>
            <Link to="/dashboard" style={{ display: 'inline-flex', padding: '10px 20px', borderRadius: 8, background: '#6366F1', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Explore Ideas
            </Link>
          </div>
        ) : (
          <div data-testid="saved-ideas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {ideas.map((idea, i) => (
              <div key={idea.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}>
                <IdeaCard idea={idea} onSaveToggle={handleSaveToggle} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedIdeas;

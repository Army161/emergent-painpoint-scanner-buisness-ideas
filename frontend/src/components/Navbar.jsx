import React, { useState, useEffect, createContext, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useTheme } from '../App';
import { Radar, BookmarkIcon, LayoutDashboard, LogOut, ChevronDown, Zap, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;

  const isLight = theme === 'light';

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to={user ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radar size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>IdeaRadar</span>
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { path: '/dashboard', icon: <LayoutDashboard size={15} />, label: 'Discover' },
              { path: '/saved', icon: <BookmarkIcon size={15} />, label: 'Saved' },
              { path: '/pricing', icon: <Zap size={15} />, label: 'Upgrade' },
            ].map(({ path, icon, label }) => (
              <Link key={path} to={path} data-testid={`nav-${label.toLowerCase()}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
                  fontSize: 14, fontWeight: 500,
                  color: isActive(path) ? 'var(--text)' : 'var(--text-medium)',
                  background: isActive(path) ? 'var(--surface-hover)' : 'transparent',
                  transition: 'all 0.15s'
                }}
              >{icon}{label}</Link>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Theme Toggle */}
          <button data-testid="theme-toggle-btn" onClick={toggleTheme}
            title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface-hi)',
              cursor: 'pointer', color: 'var(--text-medium)',
              transition: 'all 0.2s', flexShrink: 0
            }}
          >
            {isLight ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button data-testid="user-menu-btn" onClick={() => setMenuOpen(!menuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text)', fontSize: 14 }}
              >
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                {user.is_premium && (
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: 'rgba(99,102,241,0.2)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)', fontWeight: 600 }}>PRO</span>
                )}
                <ChevronDown size={14} color="var(--text-medium)" />
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, top: '110%', minWidth: 180, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px', zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-medium)' }}>{user.email}</div>
                  </div>
                  <button data-testid="logout-btn" onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444', fontSize: 14 }}
                  ><LogOut size={14} />Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/auth" data-testid="nav-login" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
              <Link to="/auth" data-testid="nav-get-started"
                style={{ fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 8, background: '#6366F1', color: '#fff', textDecoration: 'none', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
              >Get started free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

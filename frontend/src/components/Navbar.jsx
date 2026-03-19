import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Radar, BookmarkIcon, LayoutDashboard, LogOut, ChevronDown, Zap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(3,3,3,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #18181B'
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radar size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#FAFAFA', fontFamily: 'Plus Jakarta Sans' }}>IdeaRadar</span>
        </Link>

        {/* Nav Links */}
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
                  color: isActive(path) ? '#FAFAFA' : '#71717A',
                  background: isActive(path) ? 'rgba(255,255,255,0.06)' : 'transparent',
                  transition: 'all 0.15s'
                }}
              >{icon}{label}</Link>
            ))}
          </div>
        )}

        {/* Right: Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button data-testid="user-menu-btn" onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px', borderRadius: 8, border: '1px solid #27272A',
                  background: 'transparent', cursor: 'pointer', color: '#FAFAFA', fontSize: 14
                }}
              >
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                {user.is_premium && (
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: 'rgba(99,102,241,0.2)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)', fontWeight: 600 }}>PRO</span>
                )}
                <ChevronDown size={14} color="#71717A" />
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%', minWidth: 180,
                  background: '#0A0A0A', border: '1px solid #27272A', borderRadius: 10,
                  padding: '6px', zIndex: 100
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #18181B', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, color: '#FAFAFA', fontWeight: 500 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: '#71717A' }}>{user.email}</div>
                  </div>
                  <button data-testid="logout-btn" onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444', fontSize: 14 }}
                  ><LogOut size={14} />Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/auth" data-testid="nav-login" style={{ fontSize: 14, color: '#A1A1AA', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
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

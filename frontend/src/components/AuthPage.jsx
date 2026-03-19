import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Radar, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { apiClient, useAuth } from '../App';
import { toast } from 'sonner';

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    if (mode === 'register' && !form.name) return toast.error('Name is required');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
      const res = await apiClient.post(endpoint, payload);
      login(res.data.token, res.data.user);
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #27272A',
    background: '#050505', color: '#FAFAFA', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s', fontFamily: 'Inter',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030303', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Grid bg */}
      <div className="grid-bg" style={{ position: 'fixed', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />

      {/* Back */}
      <Link to="/" style={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 6, color: '#71717A', textDecoration: 'none', fontSize: 14 }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Radar size={24} color="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#FAFAFA', fontFamily: 'Plus Jakarta Sans' }}>IdeaRadar</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#71717A' }}>The Bloomberg Terminal for startup ideas</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#111', borderRadius: 8, padding: 3, marginBottom: 28, border: '1px solid #27272A' }}>
            {['login', 'register'].map((m) => (
              <button key={m} data-testid={`tab-${m}`} onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'Inter',
                  background: mode === m ? '#1E1E2E' : 'transparent',
                  color: mode === m ? '#FAFAFA' : '#71717A',
                  transition: 'all 0.2s',
                  boxShadow: mode === m ? '0 0 0 1px rgba(99,102,241,0.3)' : 'none'
                }}
              >{m === 'login' ? 'Sign In' : 'Create Account'}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 6, display: 'block' }}>Name</label>
                <input data-testid="name-input" value={form.name} onChange={set('name')} placeholder="Your name" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6366F1'} onBlur={e => e.target.style.borderColor = '#27272A'} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 6, display: 'block' }}>Email</label>
              <input data-testid="email-input" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#6366F1'} onBlur={e => e.target.style.borderColor = '#27272A'} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 6, display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input data-testid="password-input" type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = '#6366F1'} onBlur={e => e.target.style.borderColor = '#27272A'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#71717A' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button data-testid="auth-submit-btn" type="submit" disabled={loading}
              style={{ padding: '13px', borderRadius: 10, border: 'none', background: loading ? '#374151' : '#6366F1', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 0 20px rgba(99,102,241,0.3)', fontFamily: 'Plus Jakarta Sans' }}
            >{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#52525B', marginTop: 20 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#3F3F46', marginTop: 16 }}>
          Free plan includes 1 AI-generated business brief
        </p>
      </div>
    </div>
  );
};

export default AuthPage;

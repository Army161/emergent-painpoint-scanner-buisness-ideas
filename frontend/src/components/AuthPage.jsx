import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Radar, ArrowLeft, Eye, EyeOff, Sun, Moon, KeyRound, Mail } from 'lucide-react';
import { apiClient, useAuth, useTheme } from '../App';
import { toast } from 'sonner';

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // login | register | forgot | reset
  const [form, setForm] = useState({ email: '', password: '', name: '', code: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'forgot') return handleForgotPassword();
    if (mode === 'reset') return handleResetPassword();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    if (mode === 'register' && !form.name) return toast.error('Name is required');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' ? { email: form.email, password: form.password } : { email: form.email, password: form.password, name: form.name };
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

  const handleForgotPassword = async () => {
    if (!form.email) return toast.error('Enter your email');
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email: form.email });
      if (res.data.code) setResetCode(res.data.code);
      toast.success('Reset code sent! Check below.');
      setMode('reset');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!form.code || !form.newPassword) return toast.error('Fill all fields');
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { email: form.email, code: form.code, new_password: form.newPassword });
      toast.success('Password reset! You can now sign in.');
      setMode('login');
      setForm(f => ({ ...f, password: '', code: '', newPassword: '' }));
      setResetCode('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)',
    background: 'var(--surface-deep)', color: 'var(--text)', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s', fontFamily: 'Inter',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="grid-bg" style={{ position: 'fixed', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', top: 24, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-medium)', textDecoration: 'none', fontSize: 14 }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <button data-testid="auth-theme-toggle" onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-hi)', cursor: 'pointer', color: 'var(--text-medium)', transition: 'all 0.2s' }}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>
      </div>

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            {mode === 'forgot' || mode === 'reset' ? <KeyRound size={24} color="#fff" /> : <Radar size={24} color="#fff" />}
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>
            {mode === 'forgot' ? 'Forgot Password' : mode === 'reset' ? 'Reset Password' : 'IdeaRadar'}
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-medium)' }}>
            {mode === 'forgot' ? 'Enter your email to receive a reset code' : mode === 'reset' ? 'Enter the code and your new password' : 'The Bloomberg Terminal for startup ideas'}
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {(mode === 'login' || mode === 'register') && (
            <div style={{ display: 'flex', background: 'var(--surface-hi)', borderRadius: 8, padding: 3, marginBottom: 28, border: '1px solid var(--border)' }}>
              {['login', 'register'].map((m) => (
                <button key={m} data-testid={`tab-${m}`} onClick={() => setMode(m)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'Inter',
                    background: mode === m ? 'var(--surface-active)' : 'transparent',
                    color: mode === m ? 'var(--text)' : 'var(--text-medium)',
                    transition: 'all 0.2s',
                    boxShadow: mode === m ? '0 0 0 1px rgba(99,102,241,0.3)' : 'none'
                  }}
                >{m === 'login' ? 'Sign In' : 'Create Account'}</button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6, display: 'block' }}>Name</label>
                <input data-testid="name-input" value={form.name} onChange={set('name')} placeholder="Your name" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6366F1'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
            )}

            {(mode !== 'reset') && (
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6, display: 'block' }}>Email</label>
                <input data-testid="email-input" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6366F1'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
            )}

            {mode === 'reset' && (
              <>
                {resetCode && (
                  <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-medium)', marginBottom: 4 }}>Your reset code (demo mode):</div>
                    <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#6366F1', letterSpacing: '0.15em' }}>{resetCode}</div>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6, display: 'block' }}>Reset Code</label>
                  <input data-testid="reset-code-input" value={form.code} onChange={set('code')} placeholder="6-digit code" style={inputStyle} maxLength={6}
                    onFocus={e => e.target.style.borderColor = '#6366F1'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6, display: 'block' }}>New Password</label>
                  <input data-testid="new-password-input" type="password" value={form.newPassword} onChange={set('newPassword')} placeholder="New password (min 6 chars)" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366F1'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6, display: 'block' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input data-testid="password-input" type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = '#6366F1'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-medium)' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <button data-testid="auth-submit-btn" type="submit" disabled={loading}
              style={{ padding: '13px', borderRadius: 10, border: 'none', background: loading ? 'var(--border-hi)' : '#6366F1', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: '0 0 20px rgba(99,102,241,0.3)', fontFamily: 'Plus Jakarta Sans' }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Code' : 'Reset Password'}
            </button>
          </form>

          {mode === 'login' && (
            <button data-testid="forgot-password-btn" onClick={() => setMode('forgot')}
              style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 16, background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >Forgot password?</button>
          )}

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--subtle)', marginTop: mode === 'login' ? 8 : 20 }}>
            {mode === 'login' ? "Don't have an account? " : mode === 'register' ? 'Already have an account? ' : ''}
            {(mode === 'login' || mode === 'register') && (
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            )}
            {(mode === 'forgot' || mode === 'reset') && (
              <button onClick={() => { setMode('login'); setResetCode(''); }}
                style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Back to Sign In
              </button>
            )}
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--subtle)', marginTop: 16 }}>
          Free plan includes 1 AI-generated business brief
        </p>
      </div>
    </div>
  );
};

export default AuthPage;

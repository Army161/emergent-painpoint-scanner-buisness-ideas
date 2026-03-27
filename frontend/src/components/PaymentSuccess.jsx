import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { apiClient, useAuth } from '../App';
import Navbar from './Navbar';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('polling');
  const [tier, setTier] = useState('');

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    let attempts = 0;
    const maxAttempts = 8;

    const poll = async () => {
      try {
        const res = await apiClient.get(`/subscription/status/${sessionId}`);
        if (res.data.payment_status === 'paid') {
          setStatus('success');
          setTier(res.data.tier);
          const me = await apiClient.get('/auth/me');
          setUser(me.data);
          return;
        }
        if (res.data.status === 'expired') { setStatus('error'); return; }
      } catch { /* continue polling */ }

      attempts++;
      if (attempts >= maxAttempts) { setStatus('timeout'); return; }
      setTimeout(poll, 2000);
    };
    poll();
  }, [sessionId, setUser]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        {status === 'polling' && (
          <div className="animate-fade-up">
            <Loader2 size={48} color="#6366F1" style={{ margin: '0 auto 20px', display: 'block', animation: 'spin 1s linear infinite' }} />
            <h1 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>Processing your payment...</h1>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--muted)' }}>Hang tight, this only takes a moment.</p>
          </div>
        )}
        {status === 'success' && (
          <div className="animate-fade-up">
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={36} color="#22C55E" />
            </div>
            <h1 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>
              Welcome to {tier === 'business' ? 'Business' : 'Pro'}!
            </h1>
            <p style={{ margin: '0 0 32px', fontSize: 15, color: 'var(--muted)' }}>
              You now have unlimited access to AI business briefs and landing page copy generation.
            </p>
            <button data-testid="go-to-dashboard" onClick={() => navigate('/dashboard')}
              style={{ padding: '14px 32px', borderRadius: 10, border: 'none', background: '#6366F1', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 24px rgba(99,102,241,0.3)', fontFamily: 'Plus Jakarta Sans' }}
            >Start Exploring Ideas</button>
          </div>
        )}
        {(status === 'error' || status === 'timeout') && (
          <div className="animate-fade-up">
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <XCircle size={36} color="#EF4444" />
            </div>
            <h1 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans' }}>
              {status === 'timeout' ? 'Payment is still processing' : 'Something went wrong'}
            </h1>
            <p style={{ margin: '0 0 32px', fontSize: 15, color: 'var(--muted)' }}>
              {status === 'timeout' ? 'Your payment may still complete. Check your email for confirmation.' : 'The payment could not be verified. Please try again.'}
            </p>
            <button onClick={() => navigate('/pricing')}
              style={{ padding: '14px 32px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            >Back to Pricing</button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default PaymentSuccess;

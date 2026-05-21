import React, { useState } from 'react';
import { api } from '../api';
import { useToast } from '../components/ToastProvider';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await api('/api/login.php', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      toast.success('Welcome back! 🎨');
      onLogin(email, data);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />
      </div>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">🎨</div>
          <div className="login-logo-title">
            Tapi<span>fy</span>
          </div>
          <div className="login-logo-subtitle">Designer Panel · Admin Access</div>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="designer@tapify.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            id="login-submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ padding: '13px', fontSize: '15px', justifyContent: 'center' }}
          >
            {loading ? (
              <><div className="spinner spinner-sm" /> Signing in…</>
            ) : (
              '🚀 Sign In to Designer Panel'
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--muted)' }}>
          Tapify Designer Panel · Restricted Access
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

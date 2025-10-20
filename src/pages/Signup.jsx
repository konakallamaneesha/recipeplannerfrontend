import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Login from './Login';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.post('http://localhost:5000/api/users/register', { username, password });
      if (res.data && res.data.success) {
        // store credentials briefly so user can be auto-logged in and prefilled
        try {
          sessionStorage.setItem('prefillUsername', username);
          sessionStorage.setItem('prefillPassword', password);
          sessionStorage.setItem('loggedIn', '1');
          sessionStorage.setItem('username', username);
        } catch (e) {}
        // after signup, show the welcome splash before planner
        // use replace to avoid the welcome page staying in history
        navigate('/welcome', { replace: true });
      } else {
        setError('Signup failed');
        console.warn('Signup unexpected response', res && res.data);
      }
    } catch (err) {
      console.error('Signup error', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(`Signup error: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page page-enter">
      <div className="card card-entrance">
        <div className="login-hero">
          <h1 className="signup-title heading-animate" style={{
            animation: 'heading-in 700ms cubic-bezier(.2,.9,.25,1) both, glow-cyan-soft 1.8s ease-in-out infinite alternate',
            color: '#6bd6ff',
            textShadow: '0 0 3px #6bd6ff, 0 0 6px #1e5eff, 0 0 9px #6bd6ff'
          }}>Create an account</h1>
          <p className="small-muted">Sign up to save your weekly recipes</p>
        </div>

        <div className="login-form" style={{ marginTop: '1rem' }}>
          <input className="input large" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input className="input large" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div style={{ color: '#ff6b6b' }}>{error}</div>}
          <button className="btn btn-primary btn-shiny focus-ring" onClick={handleSignup} disabled={loading}>{loading ? 'Signing up...' : 'Signup'}</button>
          <div style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>Already have an account? </span>
            <button className="header-btn" onClick={() => setShowLogin(true)} style={{ marginLeft: '6px' }}>Login</button>
          </div>
        </div>
      </div>

      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <Login embedded onClose={() => setShowLogin(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

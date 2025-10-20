// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ embedded = false, onClose } = {}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const pu = sessionStorage.getItem('prefillUsername');
      const pp = sessionStorage.getItem('prefillPassword');
      if (pu) setUsername(pu);
      if (pp) setPassword(pp);
    } catch (e) {}
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.post('http://localhost:5000/api/users/login', { username, password });
      if (res.data && res.data.success) {
        // keep a minimal loggedIn flag so header can show Back button
        try { sessionStorage.setItem('loggedIn', '1'); sessionStorage.removeItem('prefillPassword'); } catch(e){}
        try { sessionStorage.setItem('username', username); } catch(e){}
        // After successful login, show welcome splash that then navigates to planner
        // After successful login, show welcome splash that then navigates to planner
        // use replace so that pressing Back does not navigate back to /welcome
        if (embedded && typeof onClose === 'function') {
          onClose();
          navigate('/welcome', { replace: true });
        } else {
          navigate('/welcome', { replace: true });
        }
      } else {
        setError('Login failed: invalid username or password');
        console.warn('Login failed response:', res && res.data);
      }
    } catch (err) {
      console.error('Login request error:', err);
      // Try to show a helpful message when server provides one
      const serverMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(`Login error: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="card">
        <div className="login-hero">
          <p className="small-muted">Sign in to continue to your Recipe Planner</p>
        </div>

        <div className="login-form" style={{ marginTop: '1rem' }}>
          <input className="input large" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input className="input large" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div style={{ color: '#ff6b6b' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
            <button className="btn" onClick={() => {
              if (embedded && typeof onClose === 'function') {
                onClose();
              } else {
                navigate('/');
              }
            }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

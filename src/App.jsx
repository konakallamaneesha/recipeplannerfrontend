// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Planner from './pages/Planner';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import Welcome from './pages/Welcome';
// animated background removed per user request

function App() {
  function HeaderControls() {
    const navigate = useNavigate();
    const location = useLocation();
    let logged = false;
    try { logged = sessionStorage.getItem('loggedIn') === '1'; } catch (e) { logged = false; }
    // Removed Admin link from header (hidden per user request)
    // On planner route, show Logout button when logged in
    if (location.pathname === '/planner' && logged) {
      return (
        <button
          className="header-btn header-logout btn-effect"
          onClick={() => {
            try {
              sessionStorage.removeItem('loggedIn');
              sessionStorage.removeItem('username');
              sessionStorage.removeItem('prefillPassword');
              sessionStorage.removeItem('prefillUsername');
              sessionStorage.removeItem('adminAuth');
            } catch (e) {}
            navigate('/');
          }}
        >Logout</button>
      );
    }
    // Default: if logged, show nothing; otherwise show Admin button on the main landing page
    if (logged) return null;
    if (location.pathname === '/') {
      return (<button className="header-btn header-admin btn-effect" onClick={() => navigate('/admin')}>Admin</button>);
    }
    return null;
  }

  function AppRouter() {
    return (
      <>
        <header className="app-header">
          <div className="app-header-inner">Weekly Recipe Planner and Meal Saver</div>
          <div className="header-right">
            <HeaderControls />
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </>
    );
  }

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;

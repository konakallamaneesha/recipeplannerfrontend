import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page page-fade-in">
      <div className="welcome-root">
        <div className="welcome-card card-entrance">
          <h1 className="welcome-title">Thank you for choosing us <span className="emoji emoji-hands" aria-hidden>🙏</span></h1>
          <p className="welcome-sub">We welcome you with lots of love <span className="emoji emoji-heart" aria-hidden>❤️</span></p>

          <div className="welcome-anim">
            <div className="wave wave-1" />
            <div className="wave wave-2" />
            <div className="wave wave-3" />

            {/* floating decorative hearts and emoji */}
            <div className="floating-icons" aria-hidden>
              <span className="float-emoji e1">✨</span>
              <span className="float-emoji e2">🍽️</span>
              <span className="float-emoji e3">🥗</span>
              <span className="float-emoji e4">🎉</span>
            </div>
          </div>

          {/* confetti pieces */}
          <div className="confetti" aria-hidden>
            {Array.from({ length: 12 }).map((_, i) => <i key={i} className={`c c${i+1}`} />)}
          </div>

          <div className="welcome-actions">
            <button className="btn btn-primary btn-shiny welcome-cta" onClick={() => navigate('/planner')} aria-label="Go to Planner">Go to Planner <span className="emoji">🚀</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}

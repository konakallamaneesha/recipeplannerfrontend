import React from 'react';
import { useLocation } from 'react-router-dom';

export default function AnimatedBackground() {
  const location = useLocation();
  // choose a variant based on pathname
  const variant = (() => {
    if (location.pathname === '/' || location.pathname === '/signup') return 'fresh';
    if (location.pathname === '/login') return 'warm';
    if (location.pathname === '/planner') return 'planner';
    if (location.pathname === '/admin') return 'admin';
    return 'fresh';
  })();

  // small selection of images (Unsplash) representing food items
  const images = {
    fresh: [
      'https://images.unsplash.com/photo-1546069901-eacef0df6022?auto=format&fit=crop&w=400&q=60',
      'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?auto=format&fit=crop&w=400&q=60',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=60'
    ],
    warm: [
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=400&q=60',
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=400&q=60'
    ],
    planner: [
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=60',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=60'
    ],
    admin: [
      'https://images.unsplash.com/photo-1526318472351-c75fcf070da9?auto=format&fit=crop&w=400&q=60',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=60'
    ]
  };

  const imgs = images[variant] || images.fresh;

  return (
    <div className={`animated-bg animated-bg--${variant}`} aria-hidden>
      {imgs.map((src, i) => (
        <div key={i} className={`floating food-${i+1}`} style={{ backgroundImage: `url(${src})` }} />
      ))}
    </div>
  );
}

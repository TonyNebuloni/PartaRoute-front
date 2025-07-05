import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  {
    label: 'Accueil',
    path: '/',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 3l9 9"/><path d="M9 21V9h6v12"/></svg>
    ),
  },
  {
    label: 'Remontées',
    path: '/my-driver-trips',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="7" rx="2"/><path d="M16 11V7a4 4 0 0 0-8 0v4"/></svg>
    ),
  },
  {
    label: 'Mes trajets',
    path: '/my-trips',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><polyline points="5 12 12 5 19 12"/></svg>
    ),
  },
  {
    label: 'Actus',
    path: '/notifications',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h2"/></svg>
    ),
  },
  {
    label: 'Compte',
    path: '/compte',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1"/></svg>
    ),
  },
];

const activeColor = '#D6FFB7';
const barBg = '#232323';
const iconInactive = '#ffffff';
const iconActive = '#232323';

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100vw',
        background: barBg,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: '70px',
        zIndex: 100,
      }}
    >
      {navItems.map((item, idx) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              textDecoration: 'none',
              position: 'relative',
              zIndex: 2,
              minWidth: 0,
            }}
          >
            <div style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              minHeight: 70,
            }}>
              {/* Conteneur bulle + texte actif */}
              {isActive ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '16px', transition: 'margin-bottom 0.3s cubic-bezier(.4,1.6,.6,1)' }}>
                  {/* Bulle animée pour l'onglet actif */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: 48,
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Cercle blanc pour effet de découpe */}
                    <div
                      style={{
                        transition: 'transform 0.3s cubic-bezier(.4,1.6,.6,1), opacity 0.3s',
                        width: '60px',
                        height: '60px',
                        background: '#ffffff',
                        borderRadius: '50%',
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: isActive ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.001)',
                        opacity: isActive ? 1 : 0,
                        zIndex: 2,
                      }}
                    />
                    {/* Bulle noire */}
                    <div
                      style={{
                        transition: 'transform 0.3s cubic-bezier(.4,1.6,.6,1), opacity 0.3s',
                        width: '48px',
                        height: '48px',
                        background: '#232323',
                        borderRadius: '50%',
                        border: `3px solid ${activeColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 3,
                        transform: isActive ? 'scale(1)' : 'scale(0.001)',
                        opacity: isActive ? 1 : 0,
                      }}
                    >
                      <span style={{ color: activeColor, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s, font-size 0.2s' }}>
                        {item.icon}
                      </span>
                    </div>
                  </div>
                  {/* Texte sous la bulle si actif */}
                  <span
                    style={{
                      color: activeColor,
                      fontWeight: 700,
                      fontFamily: 'Gluten, Arial, sans-serif',
                      fontSize: '1.05rem',
                      marginTop: 16,
                      marginBottom: isActive ? 0 : -12,
                      transition: 'color 0.2s, font-size 0.2s, opacity 0.3s, transform 0.3s',
                      minHeight: 18,
                      display: 'block',
                      textAlign: 'center',
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'translateY(0)' : 'translateY(10px)',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', paddingBottom: 12 }}>
                  <span
                    style={{
                      color: iconInactive,
                      fontSize: 28,
                      marginBottom: 0,
                      zIndex: 4,
                      transition: 'color 0.2s',
                      filter: 'none',
                      position: 'relative',
                      top: 0,
                      background: 'transparent',
                      display: 'block',
                    }}
                  >
                    {item.icon}
                  </span>
                </div>
              )}
            </div>
          </NavLink>
        );
      })}
    </nav>
  );
} 
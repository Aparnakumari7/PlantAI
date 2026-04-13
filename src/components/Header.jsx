import React, { useState } from 'react';
import { Leaf, User, LogOut, LayoutDashboard, History, ShieldCheck, HeartPulse, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ activePage, setActivePage, user, onLogout }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Scanner', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History, protected: true },
    { id: 'contact', label: 'Project', icon: HeartPulse },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, adminOnly: true },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    navigate(id === 'home' ? '/' : `/${id}`);
  };

  return (
    <header className="header glass" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--color-border)', height: '70px', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div 
          className="header-logo hover-lift" 
          onClick={() => handleNavClick('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          <div style={{ background: 'var(--color-primary)', padding: '6px', borderRadius: '10px', color: 'white' }}>
            <Leaf size={24} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-main)' }}>
            Plant<span style={{ color: 'var(--color-primary)' }}>AI</span>
          </span>
        </div>

        <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {navItems.map((item) => {
            if (item.protected && !user) return null;
            if (item.adminOnly && (!user || !user.is_admin)) return null;
            
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  background: isActive ? 'var(--color-primary-light)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div style={{ width: '1px', height: '24px', background: 'var(--color-border)', margin: '0 0.75rem' }} />

          {user ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="hover-lift"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.6rem', 
                  padding: '5px 12px 5px 6px', 
                  borderRadius: '999px',
                  background: 'white',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: 'var(--color-primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: 700
                }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{user.username}</span>
                <ChevronDown size={14} style={{ opacity: 0.5 }} />
              </button>

              {isUserMenuOpen && (
                <div 
                  className="glass animate-fade-in" 
                  style={{ 
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0, 
                    width: '200px', borderRadius: '16px', 
                    overflow: 'hidden', padding: '6px', zIndex: 1000,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                >
                  <button 
                    onClick={() => { setIsUserMenuOpen(false); handleNavClick('profile'); }}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.8rem', 
                      padding: '10px 12px', borderRadius: '10px', width: '100%',
                      fontSize: '0.9rem', color: 'var(--color-text-main)', border: 'none', background: 'transparent', cursor: 'pointer'
                    }}
                  >
                    <User size={16} /> Profile Settings
                  </button>
                  <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 8px' }} />
                  <button 
                    onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.8rem', 
                      padding: '10px 12px', borderRadius: '10px', width: '100%',
                      fontSize: '0.9rem', color: 'var(--color-danger)', border: 'none', background: 'transparent', cursor: 'pointer'
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => handleNavClick('login')}
              className="btn-primary hover-lift"
              style={{ 
                padding: '0.6rem 1.5rem', borderRadius: '999px', background: 'var(--color-primary)', 
                color: 'white', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer'
              }}
            >
              Get Started
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

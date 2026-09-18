import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/apiService';
import { Leaf, User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await loginUser(username, password);
      // Success animation delay
      setTimeout(() => {
        window.dispatchEvent(new Event('authChange'));
        navigate('/dashboard');
      }, 600);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', padding: '1rem' }}>
      <div className="glass" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative background element */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--color-primary-light)', borderRadius: '50%', opacity: 0.3, zIndex: -1 }}></div>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', padding: '12px', background: 'var(--color-primary-light)', 
            borderRadius: '16px', color: 'var(--color-primary)', marginBottom: '1rem',
            animation: 'float 3s ease-in-out infinite'
          }}>
            <Leaf size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Securely access your plant diagnostics</p>
        </div>
        
        {error && (
          <div className="animate-fade-in" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            marginBottom: '1.5rem', background: '#fef2f2', color: '#b91c1c', 
            padding: '12px 16px', borderRadius: '12px', border: '1px solid #fecaca', fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                placeholder="Enter your username"
                style={{ 
                  width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', 
                  border: '1px solid var(--color-border)', fontSize: '1rem', outline: 'none',
                  background: 'white'
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                style={{ 
                  width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', 
                  border: '1px solid var(--color-border)', fontSize: '1rem', outline: 'none',
                  background: 'white'
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary hover-lift" 
            style={{ 
              marginTop: '0.5rem', width: '100%', height: '48px', 
              background: 'var(--color-primary)', border: 'none', borderRadius: '12px',
              color: 'white', fontWeight: 700, fontSize: '1rem', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.8 : 1
            }}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Login <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
        
        <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
        </div>
        
        <p style={{ textAlign: 'center', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>Sign Up Free</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

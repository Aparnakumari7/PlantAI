import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/apiService';
import { 
  Camera, ArrowRight, ShieldCheck, Zap, 
  Leaf, Users, Scan, CheckCircle
} from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const features = [
    { 
      icon: Scan, 
      title: 'Precision Scanning', 
      desc: 'Our AI identifies 100+ diseases across 50+ plant species with high accuracy.',
      color: 'var(--color-primary)'
    },
    { 
      icon: Zap, 
      title: 'Instant Results', 
      desc: 'Get your diagnosis and treatment plan in under 5 seconds.',
      color: 'var(--color-secondary)'
    },
    { 
      icon: ShieldCheck, 
      title: 'Expert Verified', 
      desc: 'Recommendations tailored by agricultural insights and AI precision.',
      color: 'var(--color-accent)'
    },
  ];

  return (
    <div className="home-wrapper" style={{ overflow: 'hidden' }}>
      {/* HERO SECTION */}
      <section className="hero" style={{ padding: '4rem 0 6rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)', clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', zIndex: -1 }}></div>
        
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div className="animate-fade-in">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 1rem', background: 'var(--color-primary-light)', borderRadius: '999px', color: 'var(--color-primary-dark)', fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              <CheckCircle size={16} /> AI-POWERED DIAGNOSTICS
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--color-text-main)', letterSpacing: '-0.04em' }}>
              Save Your Plants with <span style={{ color: 'var(--color-primary)' }}>Advanced AI</span>
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '540px' }}>
              Instant plant disease detection. Simply upload a photo and get expert-level diagnosis, organic remedies, and care tips in seconds.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate('/dashboard')} 
                className="btn-primary hover-lift" 
                style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                Start Scanning <ArrowRight size={20} />
              </button>
              
              {!user && (
                <button 
                  onClick={() => navigate('/register')} 
                  className="hover-lift" 
                  style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px', background: 'white', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Create Account
                </button>
              )}
            </div>

            <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', marginLeft: '0.5rem' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', background: '#ccc', marginLeft: i === 1 ? 0 : '-10px', overflow: 'hidden' }}>
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                Join <span style={{ color: 'var(--color-text-main)', fontWeight: 700 }}>10,000+</span> farmers & gardeners
              </p>
            </div>
          </div>
          
          <div className="animate-fade-in" style={{ position: 'relative' }}>
            <div className="glass" style={{ borderRadius: '32px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.12)', border: '8px solid white' }}>
              <img 
                src="https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80" 
                alt="AI Analysis" 
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            {/* Floating badges */}
            <div className="glass hover-lift" style={{ position: 'absolute', top: '10%', left: '-5%', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--color-success)', padding: '6px', borderRadius: '8px', color: 'white' }}><CheckCircle size={20} /></div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>98% Accuracy</div>
            </div>
            <div className="glass hover-lift" style={{ position: 'absolute', bottom: '10%', right: '-5%', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'var(--color-primary)', padding: '6px', borderRadius: '8px', color: 'white' }}><Zap size={20} /></div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Real-time Results</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ padding: '6rem 0', background: 'var(--color-bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Smart tools for smart growth</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Our technology empowers you to take control of your crops' health with professional-grade diagnostics.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            {features.map((f, i) => (
              <div key={i} className="glass hover-lift" style={{ padding: '2.5rem', borderRadius: '24px' }}>
                <div style={{ color: f.color, marginBottom: '1.5rem' }}><f.icon size={40} /></div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>{f.title}</h4>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

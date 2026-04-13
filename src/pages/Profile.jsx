import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, getCurrentUser } from '../services/apiService';
import { 
  User, Mail, Calendar, BarChart3, 
  Activity, ShieldCheck, AlertTriangle, 
  History, Camera, Settings, LogOut,
  ChevronRight, Award, Loader2
} from 'lucide-react';

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfileData(data);
      } catch (err) {
        setError('Failed to load profile data');
      }
    };
    fetchProfile();
  }, [user, navigate]);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <div style={{ color: 'var(--color-danger)', background: '#fef2f2', padding: '2rem', borderRadius: '24px', textAlign: 'center' }}>
          <AlertTriangle size={48} style={{ marginBottom: '1rem' }} />
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Preparing your analytics dashboard...</p>
      </div>
    );
  }

  const { stats, user: userInfo } = profileData;
  const total = stats.total_predictions || 0;
  const healthyPercent = total > 0 ? (stats.healthy_plants / total) * 100 : 0;
  const diseasedPercent = total > 0 ? (stats.diseased_plants / total) * 100 : 0;

  let dateJoined = 'Recently Joined';
  if (userInfo.created_at) {
    try {
      dateJoined = `Member since ${new Date(userInfo.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    } catch (e) {}
  }

  return (
    <div className="profile-wrapper animate-fade-in" style={{ padding: '2rem 0 4rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* User Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass" style={{ padding: '2.5rem 2rem', borderRadius: '32px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><Settings size={20} /></button>
            </div>
            
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '4px solid white', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
              <User size={48} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>{userInfo.username}</h2>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
              <Mail size={16} /> {userInfo.email}
            </p>
            <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={14} /> {dateJoined}
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Award size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Achievements</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ padding: '8px 12px', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>Early Adopter</div>
              {total >= 10 && <div style={{ padding: '8px 12px', background: 'var(--color-secondary-light)', color: '#0369a1', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>Green Thumb</div>}
              {total >= 50 && <div style={{ padding: '8px 12px', background: 'var(--color-accent-light)', color: '#b45309', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>Plant Expert</div>}
            </div>
          </div>
        </div>

        {/* Stats & Activity Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BarChart3 size={24} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Garden Insights</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text-main)' }}>{total}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Scans</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-success)' }}>{stats.healthy_plants}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Healthy</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-danger)' }}>{stats.diseased_plants}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issues</div>
              </div>
            </div>

            {total > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <span>Garden Health Index</span>
                  <span style={{ color: 'var(--color-primary)' }}>{healthyPercent.toFixed(0)}% Good</span>
                </div>
                <div style={{ height: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                   <div style={{ width: `${healthyPercent}%`, background: 'var(--color-primary)', transition: 'width 1s ease' }}></div>
                   <div style={{ width: `${diseasedPercent}%`, background: 'var(--color-danger)', transition: 'width 1s ease' }}></div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button 
                onClick={() => navigate('/history')}
                className="hover-lift"
                style={{ padding: '1rem', borderRadius: '16px', background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <History size={18} /> History
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="hover-lift"
                style={{ padding: '1rem', borderRadius: '16px', background: 'var(--color-primary)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Camera size={18} /> New Scan
              </button>
            </div>
          </div>

          <div className="glass hover-lift" style={{ padding: '1.5rem', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.03)', padding: '10px', borderRadius: '12px' }}><Activity size={20} /></div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Activity Feed</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Latest garden updates</p>
              </div>
            </div>
            <ChevronRight size={20} color="var(--color-text-muted)" />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;

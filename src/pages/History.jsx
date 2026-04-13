import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getHistory, getCurrentUser, deleteHistoryItem } from '../services/apiService';
import { 
  History as HistoryIcon, Clock, Calendar, 
  ChevronRight, ArrowLeft, Loader2, AlertCircle, 
  ShieldCheck, AlertTriangle, Search, Camera, Trash2
} from 'lucide-react';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      setError('Failed to load your analysis history.');
      console.error('History Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHistory();
  }, [user, navigate]);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this scan?')) return;

    try {
      await deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  if (loading && history.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Retrieving your plant history...</p>
      </div>
    );
  }

  return (
    <div className="history-wrapper animate-fade-in" style={{ padding: '2rem 0 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ border: 'none', background: 'none', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer', marginBottom: '0.5rem', padding: 0 }}
          >
            <ArrowLeft size={18} /> Back to Scanner
          </button>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em', margin: 0 }}>Analysis History</h2>
        </div>
        <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          Total Scans: <span style={{ color: 'var(--color-primary)' }}>{history.length}</span>
        </div>
      </div>

      {error && (
        <div className="glass" style={{ padding: '1rem', border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}
      
      {history.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {history.map((item, idx) => (
            <div key={item.id || idx} className="glass hover-lift" style={{ borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              
              {/* Delete Button */}
              <button 
                onClick={(e) => handleDelete(item.id, e)}
                style={{ 
                  position: 'absolute', top: '12px', left: '12px', zIndex: 10,
                  background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '12px', padding: '8px',
                  color: '#ef4444', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                className="hover-scale"
              >
                <Trash2 size={18} />
              </button>

              <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: '#f0f0f0' }}>
                {item.image_path ? (
                  <img src={item.image_path} alt={item.plant_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                    <Camera size={48} />
                  </div>
                )}
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  {item.is_healthy ? (
                    <span style={{ background: 'var(--color-success)', color: 'white', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={12} /> Healthy
                    </span>
                  ) : (
                    <span style={{ background: 'var(--color-danger)', color: 'white', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} /> Diseased
                    </span>
                  )}
                </div>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', fontWeight: 700 }}>{item.plant_name || 'Generic Plant'}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} /> {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {!item.is_healthy && item.disease_name && (
                  <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '2px' }}>DIAGNOSIS</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.disease_name}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass" style={{ padding: '6rem 2rem', borderRadius: '32px', textAlign: 'center' }}>
          <div style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <HistoryIcon size={40} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>No Analysis History Found</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
            You haven't scanned any plants yet. Start your first diagnosis to build your garden profile.
          </p>
          <button 
            className="btn-primary hover-lift"
            onClick={() => navigate('/dashboard')}
            style={{ padding: '1rem 2rem', borderRadius: '14px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
          >
            Go to Scanner <Camera size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default History;

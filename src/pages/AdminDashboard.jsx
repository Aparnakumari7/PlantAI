import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getAdminPredictions, getCurrentUser, deleteAdminPrediction } from '../services/apiService';
import { Trash2 } from 'lucide-react';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.is_admin !== 1) {
      navigate('/login');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const statsData = await getAdminStats();
        const predictionsData = await getAdminPredictions();
        setStats(statsData);
        setPredictions(predictionsData);
      } catch (err) {
        setError('Failed to load admin data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scan? This action cannot be undone.')) return;

    try {
      await deleteAdminPrediction(id);
      setPredictions(prev => prev.filter(item => item.id !== id));
      // Refresh stats
      const statsData = await getAdminStats();
      setStats(statsData);
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Admin Panel...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;

  return (
    <div className="container mt-4" style={{ paddingBottom: '50px' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
        <i className="fas fa-shield-alt fa-2x" style={{ color: '#1b5e20', marginRight: '1rem' }}></i>
        <h2 style={{ margin: 0, color: '#1b5e20' }}>Admin Monitoring System</h2>
      </div>

      {/* Global Stats */}
      <div className="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderLeft: '5px solid #1976d2' }}>
          <h3 style={{ margin: 0, color: '#1976d2' }}>{stats.total_users}</h3>
          <p style={{ margin: 0, color: '#757575' }}>Registered Users</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderLeft: '5px solid #8e24aa' }}>
          <h3 style={{ margin: 0, color: '#8e24aa' }}>{stats.total_predictions}</h3>
          <p style={{ margin: 0, color: '#757575' }}>Total Scans</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderLeft: '5px solid #43a047' }}>
          <h3 style={{ margin: 0, color: '#43a047' }}>{stats.healthy_plants}</h3>
          <p style={{ margin: 0, color: '#757575' }}>Healthy Scans</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center', borderLeft: '5px solid #e53935' }}>
          <h3 style={{ margin: 0, color: '#e53935' }}>{stats.diseased_plants}</h3>
          <p style={{ margin: 0, color: '#757575' }}>Diseased Scans</p>
        </div>
      </div>

      {/* Global Predictions Feed */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #eee', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: 0, color: '#1b5e20' }}><i className="fas fa-globe text-success"></i> Recent Platform Activity</h4>
        </div>
        
        {predictions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px' }}>User</th>
                  <th style={{ padding: '10px' }}>Plant</th>
                  <th style={{ padding: '10px' }}>Result</th>
                  <th style={{ padding: '10px' }}>Details</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred) => (
                  <tr key={pred.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{new Date(pred.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '10px', color: '#1565c0', fontWeight: '500' }}>
                      {pred.username}
                      <div style={{ fontSize: '0.75rem', color: '#9e9e9e' }}>{pred.email}</div>
                    </td>
                    <td style={{ padding: '10px' }}>{pred.plant_name || 'Unknown'}</td>
                    <td style={{ padding: '10px' }}>
                      {pred.is_healthy ? (
                        <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>Healthy</span>
                      ) : (
                        <span style={{ color: '#c62828', fontWeight: 'bold' }}>Diseased</span>
                      )}
                    </td>
                    <td style={{ padding: '10px', color: '#757575' }}>
                      {pred.is_healthy ? '-' : pred.disease_name}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDelete(pred.id)}
                        style={{ 
                          background: '#ef4444', border: 'none', borderRadius: '8px', padding: '6px 12px',
                          color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontSize: '0.85rem', fontWeight: '500'
                        }}
                        title="Delete this scan"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#757575' }}>No activity recorded yet.</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

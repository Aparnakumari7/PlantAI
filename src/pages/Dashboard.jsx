import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DetectorTabs from '../components/DetectorTabs';
import ImageUpload from '../components/ImageUpload';
import CameraFeature from '../components/CameraFeature';
import TextPrompt from '../components/TextPrompt';
import ResultDisplay from '../components/ResultDisplay';
import LoadingOverlay from '../components/LoadingOverlay';
import { analyzePlant } from '../services/aiService';
import { savePrediction, getCurrentUser } from '../services/apiService';
import { ScanLine, Info, HelpCircle, BookOpen, AlertCircle, Zap, Cloud, Calendar, Droplets, Home as HomeIcon } from 'lucide-react';

/* ─── Info / About Section ─── */
function InfoSection() {
  return (
    <div className="info-stack animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '3rem', maxWidth: '800px', margin: '3rem auto 0' }}>
      <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px' }}>
        <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}><BookOpen size={32} /></div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>What is PlantAI?</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
          An advanced diagnostic tool powered by world-class AI to help farmers and gardeners identify 500+ plant diseases with 95% accuracy.
        </p>
      </div>

      <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px' }}>
        <div style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }}><Info size={32} /></div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>How it Works</h3>
        <ul style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', paddingLeft: '1.2rem', margin: 0 }}>
          <li style={{ marginBottom: '0.5rem' }}>Snap a photo of the affected area</li>
          <li style={{ marginBottom: '0.5rem' }}>AI analyzes symptoms instantly</li>
          <li>Get organic and chemical remedies</li>
        </ul>
      </div>

      <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px' }}>
        <div style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}><HelpCircle size={32} /></div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Common FAQs</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
          "Is it free?" — Yes, forever. <br/>
          "Is my data safe?" — We don't store your photos.
        </p>
      </div>
    </div>
  );
}

function Dashboard() {
  const [activeTab, setActiveTab]   = useState('upload');
  const [imageFile,       setImageFile]       = useState(null);
  const [imagePreview,    setImagePreview]    = useState(null);
  const [textDescription, setTextDescription] = useState('');

  // Smart Context States
  const [isSmartMode, setIsSmartMode] = useState(false);
  const [extraContext, setExtraContext] = useState({
    weather: 'Sunny/Clear',
    age: 'Young (1-6 months)',
    watering: 'Moderate (2-3 times/week)',
    environment: 'Outdoor Garden'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);

  const handleDetect = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const inputImage = imageFile || (imagePreview && activeTab !== 'text' ? imagePreview : null);
      const inputText  = activeTab === 'text' ? textDescription : null;
      
      // Pass both input and smart context to AI
      const data = await analyzePlant(inputImage, inputText, 'en', isSmartMode ? extraContext : null);
      setResult(data);
      
      if (getCurrentUser()) {
         try {
           await savePrediction({
             plant_name: data?.plantIdentified || 'Unknown',
             is_healthy: data?.isHealthy ? 1 : 0,
             plant_confidence: parseFloat(data?.confidence) || 0,
             disease_name: data?.isHealthy ? null : (data?.diseaseName || 'Unknown Disease'),
             treatment: data?.homeRemedies?.join('\n') || '',
             image_path: imagePreview || ''
           });
         } catch(err) {
           console.error("Failed to save history", err);
         }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try a different photo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setImageFile(null);
    setImagePreview(null);
    setTextDescription('');
    setIsSmartMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-wrapper" style={{ paddingBottom: '4rem' }}>
      {!result && (
        <div className="glass animate-fade-in" style={{ marginTop: '2rem', borderRadius: '32px', padding: '2rem' }}>
          <DetectorTabs activeTab={activeTab} setActiveTab={setActiveTab} lang="en" />

          {isLoading ? (
            <LoadingOverlay lang="en" />
          ) : (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                {activeTab === 'upload' && <ImageUpload imagePreview={imagePreview} setImagePreview={setImagePreview} setImageFile={setImageFile} lang="en" />}
                {activeTab === 'camera' && <CameraFeature imagePreview={imagePreview} setImagePreview={setImagePreview} setImageFile={setImageFile} lang="en" />}
                {activeTab === 'text' && <TextPrompt textDescription={textDescription} setTextDescription={setTextDescription} lang="en" />}
              </div>

              {/* Smart Context Assistant */}
              <div style={{ marginBottom: '2rem' }}>
                <button 
                  onClick={() => setIsSmartMode(!isSmartMode)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.25rem', 
                    borderRadius: '14px', background: isSmartMode ? 'var(--color-primary-light)' : 'rgba(0,0,0,0.03)', 
                    border: '1px solid ' + (isSmartMode ? 'var(--color-primary)' : 'var(--color-border)'),
                    color: isSmartMode ? 'var(--color-primary-dark)' : 'var(--color-text-main)', 
                    fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', width: 'auto'
                  }}
                >
                  <Zap size={18} /> {isSmartMode ? 'Smart Mode Enabled' : 'Enable Smart Context (Recommended)'}
                </button>

                {isSmartMode && (
                  <div className="glass animate-fade-in" style={{ marginTop: '1rem', padding: '1.5rem', borderRadius: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="input-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        <Cloud size={14} /> Recent Weather
                      </label>
                      <select 
                        value={extraContext.weather} 
                        onChange={(e) => setExtraContext({...extraContext, weather: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--color-border)', outline: 'none', background: 'white', fontSize: '0.9rem' }}
                      >
                        <option>Sunny/Clear</option>
                        <option>Humid/Rainy</option>
                        <option>Very Hot</option>
                        <option>Cold/Frosty</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        <Calendar size={14} /> Plant Age
                      </label>
                      <select 
                        value={extraContext.age} 
                        onChange={(e) => setExtraContext({...extraContext, age: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--color-border)', outline: 'none', background: 'white', fontSize: '0.9rem' }}
                      >
                        <option>Seedling (0-1 month)</option>
                        <option>Young (1-6 months)</option>
                        <option>Mature (6+ months)</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        <Droplets size={14} /> Watering
                      </label>
                      <select 
                        value={extraContext.watering} 
                        onChange={(e) => setExtraContext({...extraContext, watering: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--color-border)', outline: 'none', background: 'white', fontSize: '0.9rem' }}
                      >
                        <option>Infrequent (Once/week)</option>
                        <option>Moderate (2-3 times/week)</option>
                        <option>Frequent (Daily)</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        <HomeIcon size={14} /> Environment
                      </label>
                      <select 
                        value={extraContext.environment} 
                        onChange={(e) => setExtraContext({...extraContext, environment: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--color-border)', outline: 'none', background: 'white', fontSize: '0.9rem' }}
                      >
                        <option>Outdoor Garden</option>
                        <option>Indoor / Greenhouse</option>
                        <option>Hydroponic</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', 
                  background: '#fef2f2', color: '#b91c1c', borderRadius: '16px', border: '1px solid #fecaca', marginBottom: '1.5rem' 
                }}>
                  <AlertCircle size={20} /> {error}
                </div>
              )}

              <button
                type="button"
                className="btn-primary hover-lift"
                onClick={handleDetect}
                disabled={isLoading || (!imagePreview && activeTab !== 'text') || (activeTab === 'text' && textDescription.length < 10)}
                style={{ 
                  height: '60px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  background: 'var(--color-primary)', color: 'white', width: '100%', border: 'none', cursor: 'pointer'
                }}
              >
                <ScanLine size={24} /> Start AI Diagnosis
              </button>
            </div>
          )}
        </div>
      )}

      {result && !isLoading && (
        <div style={{ marginTop: '2rem' }}>
          <ResultDisplay result={result} lang="en" onReset={handleReset} />
        </div>
      )}

      {!isLoading && <InfoSection />}
    </div>
  );
}

export default Dashboard;

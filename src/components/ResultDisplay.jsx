import React, { useState } from 'react';
import { BookOpen, AlertTriangle, Leaf, ShieldCheck, FlaskConical, CheckCircle2, Zap, Thermometer, RefreshCcw, Share2, Info, FileDown } from 'lucide-react';
import ChatBot from './ChatBot';
import { generatePlantReport } from '../services/pdfService';

function getSeverityClass(severity) {
  if (!severity) return 'high';
  return severity.toLowerCase();
}

function parseListItem(text) {
  if (typeof text !== 'string') return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function ResultDisplay({ result, lang, onReset }) {
  const [isGenerating, setIsGenerating] = useState(false);
  if (!result) return null;

  const isHindi = lang === 'hi';
  const severity = getSeverityClass(result.severity);
  const isHealthy = result.isHealthy;

  const t = {
    aiDiagnosis: isHindi ? 'AI निदान' : 'AI DIAGNOSIS',
    identified: isHindi ? 'पहचाना गया:' : 'Identified as:',
    confidence: isHindi ? 'AI विश्वास' : 'AI Confidence',
    details: isHindi ? 'विश्लेषण विवरण' : 'Analysis Details',
    causes: isHindi ? 'संभावित कारण' : 'Potential Causes',
    homeRemedies: isHindi ? 'घरेलू और जैविक उपाय' : 'Home & Organic Remedies',
    chemical: isHindi ? 'रासायनिक उपचार' : 'Chemical Treatments',
    prevention: isHindi ? 'रोकथाम और देखभाल' : 'Prevention & Care',
    scanAnother: isHindi ? 'एक और स्कैन करें' : 'Scan Another Input',
    share: isHindi ? 'रिपोर्ट साझा करें' : 'Share Report',
    generating: isHindi ? 'रिपोर्ट तैयार हो रही है...' : 'Generating Report...'
  };

  const handleShare = async () => {
    try {
      setIsGenerating(true);
      generatePlantReport(result, lang);
    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const severityColor = isHealthy ? 'var(--color-primary)' : 
    (severity === 'high' ? 'var(--color-danger)' : 'var(--color-accent)');

  return (
    <div className="result-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Hero Result Card */}
      <div className="glass" style={{ 
        padding: '3rem 2rem', borderRadius: '32px', textAlign: 'center', 
        borderBottom: `6px solid ${severityColor}`, position: 'relative', overflow: 'hidden' 
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `${severityColor}08`, zIndex: -1 }}></div>
        
        <div style={{ display: 'inline-flex', padding: '16px', background: `${severityColor}15`, borderRadius: '24px', color: severityColor, marginBottom: '1.5rem' }}>
          {isHealthy ? <CheckCircle2 size={48} /> : <AlertTriangle size={48} />}
        </div>

        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.04em', color: 'var(--color-text-main)' }}>
          {isHealthy ? (isHindi ? 'स्वस्थ पौधा!' : 'Healthy Plant!') : result.diseaseName}
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t.identified} <strong style={{ color: 'var(--color-text-main)' }}>{result.plantIdentified}</strong>
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            <Zap size={16} /> {result.confidence || '95%'}
          </div>
          {!isHealthy && (
            <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 600, color: severityColor }}>
              <Thermometer size={16} /> {severity.toUpperCase()} Severity
            </div>
          )}
        </div>
      </div>

      {/* Details Grid - Stacked Vertically */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* About / Description */}
        {result.description && (
          <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--color-secondary)' }}><Info size={24} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.details}</h3>
            </div>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', margin: 0 }}>{result.description}</p>
          </div>
        )}

        {/* Causes (If any) */}
        {result.causes && result.causes.length > 0 && (
          <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--color-accent)' }}><AlertTriangle size={24} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.causes}</h3>
            </div>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
              {result.causes.map((c, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{parseListItem(c)}</li>)}
            </ul>
          </div>
        )}

        {/* Home Remedies */}
        {result.homeRemedies && result.homeRemedies.length > 0 && (
          <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px', background: 'var(--color-primary-light)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--color-primary)' }}><Leaf size={24} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.homeRemedies}</h3>
            </div>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
              {result.homeRemedies.map((r, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{parseListItem(r)}</li>)}
            </ul>
          </div>
        )}

        {/* Chemical Treatments */}
        {result.chemicalTreatments && result.chemicalTreatments.length > 0 && (
          <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ color: '#8b5cf6' }}><FlaskConical size={24} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.chemical}</h3>
            </div>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
              {result.chemicalTreatments.map((c, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{parseListItem(c)}</li>)}
            </ul>
          </div>
        )}

        {/* Prevention */}
        {result.prevention && result.prevention.length > 0 && (
          <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(20, 184, 166, 0.05)', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ color: '#14b8a6' }}><ShieldCheck size={24} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.prevention}</h3>
            </div>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
              {result.prevention.map((p, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{parseListItem(p)}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* AI Chatbot Section */}
      <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
        <ChatBot diseaseName={result.diseaseName} plantIdentified={result.plantIdentified} lang={lang} />
      </div>

      {/* Footer Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
        <button 
          onClick={onReset} 
          className="hover-lift" 
          disabled={isGenerating}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1rem 2rem', 
            borderRadius: '16px', background: 'white', border: '1px solid var(--color-border)', 
            fontWeight: 700, color: 'var(--color-text-main)', cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.7 : 1
          }}
        >
          <RefreshCcw size={20} /> {t.scanAnother}
        </button>
        <button 
          onClick={handleShare}
          className="hover-lift" 
          disabled={isGenerating}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1rem 2rem', 
            borderRadius: '16px', background: 'var(--color-primary)', border: 'none', 
            fontWeight: 700, color: 'white', cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.7 : 1
          }}
        >
          {isGenerating ? <RefreshCcw className="animate-spin" size={20} /> : <Share2 size={20} />} 
          {isGenerating ? t.generating : t.share}
        </button>
      </div>
    </div>
  );
}

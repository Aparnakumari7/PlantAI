import React, { useState } from 'react';
import { BookOpen, AlertTriangle, Leaf, ShieldCheck, FlaskConical, CheckCircle2, Zap, Thermometer, RefreshCcw, Share2, Info, FileDown, Eye, Calendar, Activity, Volume2, VolumeX } from 'lucide-react';
import ChatBot from './ChatBot';
import { generatePlantReport } from '../services/pdfService';
import { useVoice } from '../hooks/useVoice';

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
  const { speak, isSpeaking, stopSpeaking } = useVoice(lang);
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
    generating: isHindi ? 'रिपोर्ट तैयार हो रही है...' : 'Generating Report...',
    smartTimeline: isHindi ? '7-दिवसीय रिकवरी रोडमैप' : '7-Day Treatment Roadmap',
    visualMarkers: isHindi ? 'विजुअल मार्कर (एआई ने क्या देखा)' : 'Visual Evidence (What AI Saw)'
  };

  const handleShare = async () => {
    try {
      setIsGenerating(true);
      console.log('Starting PDF generation with result:', result);
      generatePlantReport(result, lang);
      console.log('PDF generation completed successfully');
    } catch (error) {
      console.error('PDF Generation failed:', error);
      console.error('Error stack:', error.stack);
      console.error('Result data:', result);
      alert(`Failed to generate report: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAudioSummary = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const text = isHindi 
      ? `पौधे की पहचान ${result.plantIdentified} के रूप में की गई है। निदान है ${result.diseaseName || 'स्वस्थ'}। ${result.description}`
      : `The plant was identified as ${result.plantIdentified}. The diagnosis is ${result.diseaseName || 'Healthy'}. ${result.description}`;
    speak(text);
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
        
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <button 
            onClick={handleAudioSummary}
            className="hover-lift"
            style={{ 
              background: isSpeaking ? 'var(--color-primary)' : 'white',
              color: isSpeaking ? 'white' : 'var(--color-primary)',
              border: '1px solid var(--color-primary)',
              padding: '12px', borderRadius: '50%', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {isSpeaking ? <VolumeX size={24} className="animate-pulse" /> : <Volume2 size={24} />}
          </button>
        </div>

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

        {/* Smart: Environmental Insight */}
        {result.environmentalInsight && (
          <div className="glass animate-fade-in" style={{ padding: '1.5rem', borderRadius: '20px', background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: 'var(--color-secondary)' }}><Activity size={20} /></div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>{isHindi ? 'स्मार्ट संदर्भ विश्लेषण' : 'Smart Context Insight'}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>{result.environmentalInsight}</p>
              </div>
            </div>
          </div>
        )}

        {/* Smart: Visual Markers */}
        {result.visualMarkers && result.visualMarkers.length > 0 && (
          <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--color-primary)' }}><Eye size={24} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.visualMarkers}</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {result.visualMarkers.map((marker, i) => (
                <div key={i} style={{ padding: '0.5rem 1rem', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {marker}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7-Day Treatment Roadmap */}
        {result.treatmentRoadmap && (
          <div className="glass hover-lift" style={{ padding: '2rem', borderRadius: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ color: 'var(--color-accent)' }}><Calendar size={24} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>7-Day Treatment Roadmap</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {Object.entries(result.treatmentRoadmap).map(([day, action], i) => (
                <div key={i} style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--color-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', zIndex: 1 }}>
                      {i + 1}
                    </div>
                    {i < Object.keys(result.treatmentRoadmap).length - 1 && (
                      <div style={{ width: '2px', height: 'calc(100% + 1.5rem)', background: 'var(--color-border)', position: 'absolute', top: '40px' }}></div>
                    )}
                  </div>
                  <div style={{ paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', display: 'block', marginBottom: '0.25rem' }}>
                      Day {i + 1}
                    </span>
                    <div style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>
                      {parseListItem(action)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
        <ChatBot 
          diseaseName={result.diseaseName} 
          plantIdentified={result.plantIdentified} 
          lang={lang} 
          suggestedQuestions={result.suggestedQuestions} 
        />
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

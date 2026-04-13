import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

const SAMPLE_IMAGES = [
  { id: 'tomato', name: 'Tomato Early Blight', path: '/assets/samples/tomato_early_blight.png' },
  { id: 'rose', name: 'Rose Black Spot', path: '/assets/samples/rose_black_spot.png' },
  { id: 'potato', name: 'Potato Late Blight', path: '/assets/samples/potato_late_blight.png' }
];

export default function CameraFeature({ imagePreview, setImagePreview, setImageFile, lang }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showSamples, setShowSamples] = useState(false);

  const isHindi = lang === 'hi';
  const t = {
    cameraError: isHindi ? 'कैमरा एक्सेस नहीं किया जा सका' : 'Could not access camera',
    permDenied: isHindi ? 'कैमरा अनुमति अस्वीकार कर दी गई' : 'Camera permission denied',
    noCamera: isHindi ? 'कोई कैमरा नहीं मिला' : 'No camera device found',
    takePhoto: isHindi ? 'फ़ोटो लें' : 'Take Photo',
    retake: isHindi ? 'फिर से लें' : 'Retake',
    initializing: isHindi ? 'कैमरा शुरू हो रहा है...' : 'Initializing camera...',
    trySamples: isHindi ? 'नमूना छवियों को आजमाएं' : 'Try sample images',
    selectSample: isHindi ? 'एक नमूना छवि चुनें' : 'Select a sample image'
  };

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error("Play error:", e));
        };
      }
      setError(null);
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(t.permDenied);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError(t.noCamera);
      } else {
        setError(t.cameraError);
      }
      // If camera fails, suggest samples automatically
      setShowSamples(true);
    } finally {
      setIsInitializing(false);
    }
  }, [t.permDenied, t.noCamera, t.cameraError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!imagePreview && !showSamples) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [imagePreview, showSamples, startCamera, stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUrl);
      
      stopCamera();
      
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
          setImageFile(file);
        });
    }
  };

  const selectSample = (sample) => {
    setImagePreview(sample.path);
    // For samples, we pass the URL string as the image file source 
    // The aiService handles both File objects and data/URL strings
    setImageFile(null); 
    setShowSamples(false);
  };

  const resetCamera = () => {
    setImagePreview(null);
    setImageFile(null);
    setShowSamples(false);
    startCamera();
  };

  if (imagePreview) {
    return (
      <div className="input-method-container animate-fade-in">
        <div className="image-preview-container">
          <img src={imagePreview} alt="Preview" className="image-preview" />
          <button className="btn-remove-image" onClick={resetCamera} title={t.retake}>
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (showSamples) {
    return (
      <div className="input-method-container animate-fade-in">
        <div className="samples-header">
          <ImageIcon size={20} />
          <span>{t.selectSample}</span>
        </div>
        <div className="samples-grid">
          {SAMPLE_IMAGES.map(sample => (
            <div key={sample.id} className="sample-item" onClick={() => selectSample(sample)}>
              <img src={sample.path} alt={sample.name} />
              <div className="sample-label">{sample.name}</div>
            </div>
          ))}
        </div>
        <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setShowSamples(false)}>
          <RefreshCw size={16} /> {isHindi ? 'कैमरा पुनः प्रयास करें' : 'Retry Camera'}
        </button>
      </div>
    );
  }

  return (
    <div className="input-method-container animate-fade-in">
      <div className="camera-container">
        {isInitializing && (
          <div className="camera-overlay">
            <RefreshCw size={32} className="animate-spin" />
            <p>{t.initializing}</p>
          </div>
        )}
        
        {error && (
          <div className="camera-overlay error">
            <AlertCircle size={32} />
            <p>{error}</p>
            <button className="btn-sample-trigger" onClick={() => setShowSamples(true)}>
              {t.trySamples}
            </button>
          </div>
        )}

        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="camera-video"
          style={{ display: error || isInitializing ? 'none' : 'block' }}
        />

        {!error && !isInitializing && (
          <div className="camera-controls">
            <button className="btn-capture" onClick={capturePhoto} title={t.takePhoto}>
              <Camera size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

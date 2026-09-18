import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, AlertCircle, Settings } from 'lucide-react';

export default function CameraFeature({ imagePreview, setImagePreview, setImageFile, lang }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);

  const isHindi = lang === 'hi';
  const t = {
    cameraError: isHindi ? 'कैमरा एक्सेस नहीं किया जा सका' : 'Could not access camera',
    permDenied: isHindi ? 'कैमरा अनुमति अस्वीकार कर दी गई' : 'Camera permission denied',
    noCamera: isHindi ? 'कोई कैमरा नहीं मिला' : 'No camera device found',
    takePhoto: isHindi ? 'फ़ोटो लें' : 'Take Photo',
    retake: isHindi ? 'फिर से लें' : 'Retake',
    initializing: isHindi ? 'कैमरा शुरू हो रहा है...' : 'Starting camera...',
    startCamera: isHindi ? 'कैमरा शुरू करें' : 'Start Camera',
    retryCamera: isHindi ? 'कैमरा पुनः प्रयास करें' : 'Retry Camera',
    permissionHelp: isHindi ? 'कैमरा अनुमति दें और पुनः प्रयास करें' : 'Please allow camera permission and try again',
    httpsRequired: isHindi ? 'कैमरा के लिए HTTPS आवश्यक है' : 'HTTPS required for camera access'
  };

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    setCameraStarted(false);
    
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Check if we're on HTTPS or localhost
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
      if (!isSecure) {
        throw new Error('HTTPS_REQUIRED');
      }
      
      // Request camera with back camera preference for mobile
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(() => {
                setCameraStarted(true);
                resolve();
              })
              .catch(reject);
          };
          videoRef.current.onerror = reject;
        });
      }
      
      setError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraStarted(false);
      
      if (err.message === 'HTTPS_REQUIRED') {
        setError(t.httpsRequired);
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(t.permDenied);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError(t.noCamera);
      } else {
        setError(t.cameraError);
      }
    } finally {
      setIsInitializing(false);
    }
  }, [t.permDenied, t.noCamera, t.cameraError, t.httpsRequired]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraStarted(false);
  }, []);

  // Auto-start camera when component mounts (only if no image preview)
  useEffect(() => {
    if (!imagePreview) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [imagePreview, startCamera, stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && cameraStarted) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImagePreview(dataUrl);
      
      stopCamera();
      
      // Convert to file
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          setImageFile(file);
        });
    }
  };

  const resetCamera = () => {
    setImagePreview(null);
    setImageFile(null);
    setError(null);
    startCamera();
  };

  // If we have an image preview, show it
  if (imagePreview) {
    return (
      <div className="input-method-container animate-fade-in">
        <div className="image-preview-container">
          <img src={imagePreview} alt="Captured photo" className="image-preview" />
          <button className="btn-remove-image" onClick={resetCamera} title={t.retake}>
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="input-method-container animate-fade-in">
      <div className="camera-container">
        {/* Loading State */}
        {isInitializing && (
          <div className="camera-overlay">
            <RefreshCw size={32} className="animate-spin" />
            <p>{t.initializing}</p>
          </div>
        )}
        
        {/* Error State */}
        {error && !isInitializing && (
          <div className="camera-overlay error">
            <AlertCircle size={32} />
            <p>{error}</p>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn-primary" onClick={startCamera}>
                <RefreshCw size={16} /> {t.retryCamera}
              </button>
              {error === t.permDenied && (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  {t.permissionHelp}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Camera Video */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="camera-video"
          style={{ 
            display: (error || isInitializing) ? 'none' : 'block',
            width: '100%',
            height: 'auto',
            borderRadius: '12px'
          }}
        />

        {/* Camera Controls */}
        {cameraStarted && !error && !isInitializing && (
          <div className="camera-controls">
            <button className="btn-capture" onClick={capturePhoto} title={t.takePhoto}>
              <Camera size={24} />
            </button>
          </div>
        )}
        
        {/* Start Camera Button (if not started and no error) */}
        {!cameraStarted && !error && !isInitializing && (
          <div className="camera-overlay">
            <Camera size={32} />
            <button className="btn-primary" onClick={startCamera}>
              <Camera size={16} /> {t.startCamera}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

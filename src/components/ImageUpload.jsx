import React, { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';

export default function ImageUpload({ imagePreview, setImagePreview, setImageFile, lang }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const isHindi = lang === 'hi';
  const t = {
    dragDrop: isHindi ? 'अपनी छवि यहाँ खींचें और छोड़ें' : 'Drag and drop your image here',
    orBrowse: isHindi ? 'या ब्राउज़ करने के लिए क्लिक करें' : 'or click to browse',
    formats: 'PNG, JPG, WEBP'
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    // Only accept basic images
    if (!file.type.match('image.*')) {
      alert(isHindi ? 'कृपया एक वैध छवि फ़ाइल चुनें' : 'Please select a valid image file');
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="input-method-container animate-fade-in">
      {imagePreview ? (
        <div className="image-preview-container">
          <img src={imagePreview} alt="Plant Preview" className="image-preview" />
          <button className="btn-remove-image" onClick={clearImage}>
            <X size={16} />
          </button>
        </div>
      ) : (
        <div 
          className={`dropzone ${isDragging ? 'active' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/png, image/jpeg, image/webp" 
            style={{ display: 'none' }} 
          />
          <UploadCloud size={48} className="dropzone-icon" />
          <div className="dropzone-text">{t.dragDrop}</div>
          <div className="dropzone-subtext">{t.orBrowse}</div>
          <div className="dropzone-subtext" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>{t.formats}</div>
        </div>
      )}
    </div>
  );
}

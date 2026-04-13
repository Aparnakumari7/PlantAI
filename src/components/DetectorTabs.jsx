import React from 'react';
import { Camera, Upload, FileText } from 'lucide-react';

export default function DetectorTabs({ activeTab, setActiveTab, lang }) {
  const isHindi = lang === 'hi';

  const tabs = [
    { id: 'camera', icon: <Camera size={24} />, label: isHindi ? 'कैमरा' : 'Camera' },
    { id: 'upload', icon: <Upload size={24} />, label: isHindi ? 'अपलोड' : 'Upload' },
    { id: 'text', icon: <FileText size={24} />, label: isHindi ? 'टेक्स्ट' : 'Text' }
  ];

  return (
    <div className="icon-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`icon-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <div className="icon-tab-circle">
            {tab.icon}
          </div>
          <span className="icon-tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

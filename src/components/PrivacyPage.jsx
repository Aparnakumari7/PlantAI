import React from 'react';
import { ShieldCheck, Eye, Lock, Database, Trash2, UserCheck, AlertCircle } from 'lucide-react';

const sections = [
  {
    icon: <Eye size={22} />,
    title: 'Information We Collect',
    body: `When you use Plant Disease Detector, the only data we process is the image you voluntarily upload or capture with your camera, or the text description you type. We do not collect your name, email address, location, or any other personal identifying information unless you voluntarily contact us.`
  },
  {
    icon: <Database size={22} />,
    title: 'How We Use Your Data',
    body: `Images and text descriptions are transmitted securely to Google's Gemini AI API solely for the purpose of generating a plant disease diagnosis. The result is returned to your browser in real time. We do not use your data for advertising, profiling, or any secondary purpose.`
  },
  {
    icon: <Trash2 size={22} />,
    title: 'Data Retention',
    body: `We do not store any images you upload. They are processed in real-time and immediately discarded after the AI returns a result. No image or text input is saved to any database, server, or cloud storage operated by us.`
  },
  {
    icon: <Lock size={22} />,
    title: 'Data Security',
    body: `All data transmitted between your browser and our service uses HTTPS encryption. We follow industry-standard security practices to ensure your information is protected during transmission. Since we do not store data, the risk of a data breach affecting your images is effectively zero.`
  },
  {
    icon: <UserCheck size={22} />,
    title: 'Third-Party Services',
    body: `This application uses the Google Gemini AI API to process plant images and generate diagnoses. Your image data is sent to Google's servers under Google's own privacy policy. We encourage you to review Google's Privacy Policy at https://policies.google.com/privacy for details on how Google handles data.`
  },
  {
    icon: <AlertCircle size={22} />,
    title: 'Children\'s Privacy',
    body: `This service is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will take steps to delete it.`
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Your Rights',
    body: `Since we do not retain any personal data or images, there is no stored data to request, modify, or delete. If you have any concerns about your privacy while using this service, please contact your project administrator.`
  },
];

export default function PrivacyPage() {
  return (
    <div className="static-page animate-fade-in">
      <div className="static-page-hero">
        <div className="static-page-hero-icon"><ShieldCheck size={40} color="white" /></div>
        <h1 className="static-page-title">Privacy Policy</h1>
        <p className="static-page-subtitle">
          Your privacy is important to us. This policy explains how we handle your data.
        </p>
        <p className="static-page-meta">Last updated: May 2026</p>
      </div>

      <div className="static-sections">
        {sections.map((s, i) => (
          <div className="static-section" key={i}>
            <div className="static-section-header">
              <div className="static-section-icon">{s.icon}</div>
              <h2 className="static-section-title">{s.title}</h2>
            </div>
            <p className="static-section-body">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

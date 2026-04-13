import React from 'react';
import { Mail, MapPin, BookOpen, Users, Award, GraduationCap, Building2, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="static-page animate-fade-in">
      {/* ── Project Report Header ── */}
      <div className="report-card">
        <div className="report-header-top">
          <div className="report-logo">
            <span style={{ fontSize: '2.5rem' }}>🌿</span>
          </div>
          <p className="report-type">MINI PROJECT </p>
          <h1 className="report-title">SMART PLANT DISEASE DETECTION</h1>
          <div className="report-divider" />
          <p className="report-subtitle">
            Submitted in partial fulfillment of the requirements for the award of the degree of
          </p>
          <h2 className="report-degree">
            BACHELOR OF TECHNOLOGY IN<br />COMPUTER SCIENCE AND ENGINEERING
          </h2>
        </div>

        {/* ── Team Members ── */}
        <div className="report-section-label">
          <Users size={18} /> Submitted By
        </div>
        <div className="report-members-grid">
          {[
            { name: 'N. Ashwitha',     roll: '24UP5A0523' },
            { name: 'P. Srinidhi',     roll: '23UP1A05N2' },
            { name: 'Aparna Kumari',   roll: '23UP1A05I7' },
            { name: 'A. Navya Sree',   roll: '23UP1A05I8' },
          ].map((m, i) => (
            <div className="report-member-card" key={i}>
              <div className="report-member-avatar">
                {m.name.charAt(0)}
              </div>
              <div>
                <div className="report-member-name">{m.name}</div>
                <div className="report-member-roll">{m.roll}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Guide ── */}
        <div className="report-section-label">
          <GraduationCap size={18} /> Under the Guidance of
        </div>
        <div className="report-guide-box">
          <div className="report-guide-name">Mrs. P. Rupa</div>
          <div className="report-guide-title">Assistant Professor</div>
          <div className="report-guide-dept">Department of Computer Science & Engineering</div>
        </div>

        {/* ── Institution ── */}
        <div className="report-section-label">
          <Building2 size={18} /> Institution
        </div>
        <div className="report-institution-box">
          <h3 className="report-inst-name">
            VIGNAN INSTITUTE OF MANAGEMENT AND TECHNOLOGY FOR WOMEN
          </h3>
          <p className="report-inst-sub">
            (Affiliated to JNTUH, Hyderabad &nbsp;|&nbsp; Accredited by NBA)
          </p>
          <div className="report-inst-details">
            <span><MapPin size={14} /> Kondapur (V), Ghatkesar (M), Medchal-Malkajgiri (D) – 501301</span>
            <span><Award size={14} /> Academic Year: 2023–2027</span>
          </div>
          <div className="report-department-badge">
            Department of Computer Science &amp; Engineering
          </div>
        </div>
      </div>
    </div>
  );
}

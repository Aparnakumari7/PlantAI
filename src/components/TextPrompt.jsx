import React from 'react';

export default function TextPrompt({ textDescription, setTextDescription, lang }) {
  const isHindi = lang === 'hi';
  
  const t = {
    placeholder: isHindi 
      ? 'अपने पौधे के लक्षणों का वर्णन करें (उदा. टमाटर की पत्तियों पर पीले धब्बे...)' 
      : 'Describe the symptoms of your plant (e.g., yellow spots on tomato leaves...)'
  };

  return (
    <div className="input-method-container animate-fade-in">
      <div className="textarea-container">
        <textarea
          className="textarea"
          placeholder={t.placeholder}
          value={textDescription}
          onChange={(e) => setTextDescription(e.target.value)}
        />
      </div>
    </div>
  );
}

import React from 'react';

const LOADING_MESSAGES = [
  "Analyzing plant image...",
  "Identifying disease patterns...",
  "Cross-referencing disease database...",
  "Generating treatment recommendations...",
  "Finalizing diagnosis..."
];

const LOADING_MESSAGES_HI = [
  "पौधे की छवि का विश्लेषण हो रहा है...",
  "रोग के पैटर्न की पहचान हो रहा है...",
  "रोग डेटाबेस में मिलान हो रहा है...",
  "उपचार की सिफारिशें तैयार हो रही हैं...",
  "निदान को अंतिम रूप दिया जा रहा है..."
];

export default function LoadingOverlay({ lang }) {
  const [msgIndex, setMsgIndex] = React.useState(0);
  const isHindi = lang === 'hi';
  const messages = isHindi ? LOADING_MESSAGES_HI : LOADING_MESSAGES;

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="loading-overlay animate-fade-in">
      <div className="loading-spinner" />
      <p className="loading-text">{messages[msgIndex]}</p>
      <div className="loading-progress-bar">
        <div className="loading-progress-fill" />
      </div>
    </div>
  );
}

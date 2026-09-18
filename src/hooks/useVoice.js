import { useState, useCallback } from 'react';

export const useVoice = (lang = 'en') => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported] = useState({
    stt: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    tts: 'speechSynthesis' in window
  });

  const bcp47 = lang === 'hi' ? 'hi-IN' : 'en-US';

  // --- Text to Speech (TTS) ---
  const speak = useCallback((text) => {
    if (!supported.tts) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcp47;
    
    // Find a better voice if possible
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith(bcp47) && v.name.includes('Google'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [supported.tts, bcp47]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // --- Speech to Text (STT) ---
  const listen = useCallback((onResult) => {
    if (!supported.stt) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = bcp47;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    recognition.start();
    return recognition;
  }, [supported.stt, bcp47]);

  return { isListening, isSpeaking, supported, speak, stopSpeaking, listen };
};

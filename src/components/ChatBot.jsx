import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, ChevronDown, ChevronUp, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { chatFollowUp } from '../services/aiService';
import { useVoice } from '../hooks/useVoice';

export default function ChatBot({ diseaseName, plantIdentified, lang, suggestedQuestions }) {
  const isHindi = lang === 'hi';
  const { speak, listen, isSpeaking, isListening, stopSpeaking } = useVoice(lang);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: isHindi
        ? `नमस्ते! मैंने आपकी छवि का विश्लेषण किया है। **${diseaseName}** के बारे में आपके और कोई प्रश्न हैं?`
        : `Hello! I've analyzed your image. What other questions do you have about **${diseaseName}**?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current && messages.length > 1) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (overrideText = null) => {
    const question = (overrideText || input).trim();
    if (!question || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await chatFollowUp(question, diseaseName, plantIdentified || 'unknown plant', lang);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      
      // Auto-speak in voice mode
      if (isVoiceMode) {
        speak(reply.replace(/\*\*/g, '')); // Strip markdown for cleaner audio
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: isHindi ? 'क्षमा करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें।' : 'Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) return;
    stopSpeaking();
    listen((transcript) => {
      setInput(transcript);
      // Optional: automatically send after voice recognition
      // sendMessage(transcript); 
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple markdown bold renderer
  const renderText = (text) => {
    if (typeof text !== 'string') return text;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="chatbot-container animate-fade-in">
      <button className="chatbot-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="chatbot-header-left">
          <MessageCircle size={20} />
          <span>{isHindi ? 'फॉलो-अप चैट' : 'Follow-up Chat'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsVoiceMode(!isVoiceMode); if (isSpeaking) stopSpeaking(); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', 
              background: isVoiceMode ? 'var(--color-primary-light)' : 'rgba(0,0,0,0.1)',
              padding: '4px 8px', borderRadius: '8px', cursor: 'pointer',
              color: isVoiceMode ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
              fontSize: '0.7rem', fontWeight: 700
            }}
          >
            {isVoiceMode ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {isHindi ? 'पॉइस मोड' : 'Voice Mode'}
          </button>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {isOpen && (
        <div className="chatbot-body">
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`} style={{ position: 'relative' }}>
                <div className="chat-bubble">
                  {renderText(msg.text)}
                </div>
                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => speak(msg.text.replace(/\*\*/g, ''))}
                    style={{ 
                      position: 'absolute', right: '-30px', bottom: '10px', 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      color: 'var(--color-text-muted)', opacity: 0.6 
                    }}
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant">
                <div className="chat-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Smart Suggested Questions */}
          {suggestedQuestions && suggestedQuestions.length > 0 && !isLoading && (
            <div style={{ padding: '0 1rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="hover-lift"
                  style={{ 
                    padding: '6px 12px', background: 'white', border: '1px solid var(--color-primary)', 
                    borderRadius: '20px', color: 'var(--color-primary)', fontSize: '0.75rem', 
                    fontWeight: 600, cursor: 'pointer' 
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="chatbot-input-row">
            <button
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              onClick={handleMicClick}
              style={{
                background: isListening ? 'var(--color-danger)' : 'rgba(0,0,0,0.05)',
                border: 'none', color: isListening ? 'white' : 'var(--color-text-muted)',
                padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}
            >
              {isListening ? <MicOff size={20} className="animate-pulse" /> : <Mic size={20} />}
            </button>
            <input
              type="text"
              className="chatbot-input"
              placeholder={isListening ? (isHindi ? 'सुन रहा हूँ...' : 'Listening...') : (isHindi ? 'फॉलो-अप प्रश्न पूछें...' : 'Ask a follow-up question...')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              className="chatbot-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

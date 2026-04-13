import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { chatFollowUp } from '../services/aiService';

export default function ChatBot({ diseaseName, plantIdentified, lang }) {
  const isHindi = lang === 'hi';
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

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await chatFollowUp(question, diseaseName, plantIdentified || 'unknown plant', lang);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: isHindi ? 'क्षमा करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें।' : 'Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple markdown bold renderer
  const renderText = (text) => {
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
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="chatbot-body">
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="chat-bubble">
                  {renderText(msg.text)}
                </div>
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

          <div className="chatbot-input-row">
            <input
              type="text"
              className="chatbot-input"
              placeholder={isHindi ? 'फॉलो-अप प्रश्न पूछें...' : 'Ask a follow-up question...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              className="chatbot-send-btn"
              onClick={sendMessage}
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

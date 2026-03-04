import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Bot, User, ArrowLeft, Loader2, Info } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const threadId = useRef(location.state?.threadId || `user_${Math.random().toString(36).substring(7)}`).current;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSources, setShowSources] = useState(null); // Track which message's sources to show
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleChat = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, { 
        question: input, 
        thread_id: threadId 
      });

      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: response.data.answer,
        sources: response.data.sources // NEW: Store retrieval metadata
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "Error connecting to server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-layout">
      <header className="chat-nav">
        <button onClick={() => navigate('/')} className="nav-back-icon" style={{ background: 'none', border: 'none' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="nav-title">Conversation</h1>
        <div className="thread-badge">ID: {threadId}</div>
      </header>

      <div className="message-area scroll-custom">
        {messages.map((m, i) => (
          <div key={i} className={`message-row ${m.role === 'user' ? 'row-user' : 'row-bot'}`}>
            <div className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
              <div className="bubble-text">
                {m.content}
                
                {/* NEW: Source Attribution & Scores */}
                {m.sources && m.sources.length > 0 && (
                  <div className="sources-section">
                    <button 
                      onClick={() => setShowSources(showSources === i ? null : i)}
                      className="btn-show-sources"
                    >
                      <Info size={12} /> {showSources === i ? "Hide Context" : "View Retrieval Scores"}
                    </button>
                    
                    {showSources === i && (
                      <div className="sources-dropdown">
                        {m.sources.map((s, idx) => (
                          <div key={idx} className="source-card">
                            <div className="source-header">
                              <span className="score-tag">Similarity: {(s.score * 100).toFixed(1)}%</span>
                              <span className="source-name">{s.source}</span>
                            </div>
                            <p className="source-snippet">"{s.content.substring(0, 120)}..."</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && <div className="loader-container"><Loader2 className="spin" size={24} /></div>}
        <div ref={chatEndRef} />
      </div>

      <footer className="input-footer">
        <form onSubmit={handleChat} className="chat-form">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about the document..." className="main-input" disabled={loading} />
          <button type="submit" className="btn-send" disabled={loading || !input.trim()}><Send size={20} /></button>
        </form>
      </footer>
    </div>
  );
};

export default Chat;
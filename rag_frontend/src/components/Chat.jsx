import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Bot, User, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const threadId = useRef(
    location.state?.threadId || `user_${Math.random().toString(36).substring(7)}`
  ).current;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        content: response.data.answer 
      }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I'm having trouble connecting to the server. Please check if the backend is running." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-layout">
      <header className="chat-nav">
        <button 
          onClick={() => navigate('/')} 
          className="nav-back-icon"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="nav-title">Conversation</h1>
        <div className="thread-badge">Session: {threadId}</div>
      </header>

  
      <div className="message-area scroll-custom">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>
            Ask a question about your uploaded document!
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`message-row ${m.role === 'user' ? 'row-user' : 'row-bot'}`}>
            <div className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
              <div className="bubble-icon">
                {m.role === 'bot' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className="bubble-text">{m.content}</div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="loader-container" style={{ display: 'flex', padding: '10px' }}>
            <Loader2 className="spin" size={24} color="#6366f1" />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      
      <footer className="input-footer">
        <form onSubmit={handleChat} className="chat-form">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask anything..." 
            className="main-input"
            disabled={loading}
          />
          <button type="submit" className="btn-send" disabled={loading || !input.trim()}>
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Chat;


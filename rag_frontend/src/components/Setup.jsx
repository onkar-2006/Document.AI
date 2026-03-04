import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, List, MessageSquare, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Setup = ({ source }) => {
  const navigate = useNavigate();
  const [val, setVal] = useState("");
  const [status, setStatus] = useState("");
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState(null);

  const handleSubmit = async () => {
    const threadId = `user_${Math.random().toString(36).substring(7)}`;
    setLoading(true);
    setStatus("Analyzing & Splitting Document...");
    setChunks([]);

    try {
      const formData = new FormData();
      const uploadUrl = `${API_BASE}/ingest?thread_id=${threadId}`;

      if (source === 'file') {
        formData.append("file", val); 
      } else {
        formData.append("url", val);  
      }

      const response = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setChunks(response.data.chunks || []);
      setActiveThreadId(threadId);
      setStatus("Indexing Complete! Chunks stored in Vector DB.");
    } catch (err) {
      setStatus("Error: Ingestion failed. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  const handleStartChat = () => {
    navigate('/chat', { state: { threadId: activeThreadId } });
  }

  if (!source) return <div className="fullscreen-center"><Link to="/" className="btn-primary" style={{width:'auto', padding:'10px 20px'}}>Please select a source first</Link></div>;

  return (
    <div className="fullscreen-center bg-gradient">
      <button onClick={() => navigate('/')} className="back-link"><ArrowLeft size={20} /> Back</button>
      <div className="setup-container">
        <h2 className="setup-title">Configure {source}</h2>
        
        <div className="form-group">
          {source === 'file' ? (
            <input 
              type="file" 
              onChange={(e) => setVal(e.target.files[0])} 
              className="custom-file-input" 
              disabled={loading || activeThreadId}
            />
          ) : (
            <input 
              value={val} 
              onChange={(e) => setVal(e.target.value)} 
              placeholder="Enter URL" 
              className="custom-url-input" 
              disabled={loading || activeThreadId}
            />
          )}

          {!activeThreadId ? (
            <button 
              onClick={handleSubmit} 
              className="btn-primary" 
              disabled={!val || loading}
            >
              {loading ? <Loader2 className="spin" size={20} /> : "Process & Chunk Document"}
            </button>
          ) : (
            <button 
              onClick={handleStartChat} 
              className="btn-primary btn-success-pulse" 
              style={{ background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <MessageSquare size={18} />
              Start Conversation
            </button>
          )}
        </div>
        
        {status && (
          <div className="status-area">
            <p className="status-text" style={{ color: activeThreadId ? '#10b981' : 'var(--accent)', fontWeight: '600' }}>
              {status}
            </p>
            
            {chunks.length > 0 && (
              <div className={`chunk-list-preview ${activeThreadId ? 'chunk-list-ready' : ''}`}>
                <p style={{marginBottom: '12px'}}><List size={14} /> <strong>{chunks.length} Knowledge Segments:</strong></p>
                <div className="chunk-scroll">
                  {chunks.map((c, i) => (
                    <div key={i} className="chunk-item-mini">
                       <span className="chunk-index">CHUNK {i+1}</span> 
                       <span style={{opacity: 0.8}}>"{c.substring(0, 120)}..."</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Setup;
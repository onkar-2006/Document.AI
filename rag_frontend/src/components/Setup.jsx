import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, List } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Setup = ({ source }) => {
  const navigate = useNavigate();
  const [val, setVal] = useState("");
  const [status, setStatus] = useState("");
  const [chunks, setChunks] = useState([]); // NEW: Store chunks for preview

  const handleSubmit = async () => {
    const threadId = `user_${Math.random().toString(36).substring(7)}`;
    setStatus("Processing & Chunking...");

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
      
      // NEW: Show chunks created
      setChunks(response.data.chunks || []);
      setStatus("Indexing Complete!");

      // Wait 2 seconds so user can see the chunks, then navigate
      setTimeout(() => {
        navigate('/chat', { state: { threadId } });
      }, 2500);

    } catch (err) {
      setStatus("Error: Ingestion failed.");
      console.error("Ingestion Error:", err.response?.data || err.message);
    }
  }

  if (!source) return <div className="fullscreen-center"><Link to="/" className="btn-primary" style={{width:'auto', padding:'10px 20px'}}>Please select a source first</Link></div>;

  return (
    <div className="fullscreen-center bg-gradient">
      <button onClick={() => navigate('/')} className="back-link"><ArrowLeft size={20} /> Back</button>
      <div className="setup-container">
        <h2 className="setup-title">Configure {source}</h2>
        <div className="form-group">
          {source === 'file' ? (
            <input type="file" onChange={(e) => setVal(e.target.files[0])} className="custom-file-input" />
          ) : (
            <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Enter URL" className="custom-url-input" />
          )}
          <button onClick={handleSubmit} className="btn-primary" disabled={!val}>Initialize Chat</button>
        </div>
        
        {status && (
          <div className="status-area">
            <p className="status-text">{status}</p>
            {chunks.length > 0 && (
              <div className="chunk-list-preview">
                <p><List size={14} /> <strong>{chunks.length} chunks created:</strong></p>
                <div className="chunk-scroll">
                  {chunks.slice(0, 3).map((c, i) => (
                    <div key={i} className="chunk-item-mini">"{c.substring(0, 80)}..."</div>
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
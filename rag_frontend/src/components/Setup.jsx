import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://localhost:8000";

const Setup = ({ source }) => {
  const navigate = useNavigate();
  const [val, setVal] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    // 1. Generate a unique thread_id for this session
    const threadId = `user_${Math.random().toString(36).substring(7)}`;
    setStatus("Processing...");

    try {
      if (source === 'file') {
        const formData = new FormData();
        formData.append("file", val);
        // 2. Added thread_id as a query parameter to match backend
        await axios.post(`${API_BASE}/ingest?thread_id=${threadId}`, formData);
      } else {
        // Updated endpoints to match your current backend structure
        const endpoint = source === 'youtube' ? '/ingest/youtube' : '/ingest/url';
        await axios.post(`${API_BASE}${endpoint}?thread_id=${threadId}`, { url: val });
      }
      
      // 3. Pass the threadId to the Chat component via state
      navigate('/chat', { state: { threadId } });
    } catch (err) { 
      setStatus("Error: Make sure the backend is running."); 
    }
  };

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
          <button onClick={handleSubmit} className="btn-primary">Initialize Chat</button>
        </div>
        {status && <p className="status-text">{status}</p>}
      </div>
    </div>
  );
};

export default Setup;
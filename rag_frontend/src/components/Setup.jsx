import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Setup = ({ source }) => {

  const navigate = useNavigate();
  const [val, setVal] = useState("");
  const [status, setStatus] = useState("");
  const handleSubmit = async () => {
  const threadId = `user_${Math.random().toString(36).substring(7)}`;
  setStatus("Processing...");

  try {
    
    const formData = new FormData();

    const uploadUrl = `${API_BASE}/ingest?thread_id=${threadId}`;

    if (source === 'file') {
      formData.append("file", val); 
    } else {
      formData.append("url", val);  
    }

    await axios.post(uploadUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    
    navigate('/chat', { state: { threadId } });
  } catch (err) {
    setStatus("Error: Ingestion failed. Check console for details.");
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
          <button onClick={handleSubmit} className="btn-primary">Initialize Chat</button>
        </div>
        {status && <p className="status-text">{status}</p>}
      </div>
    </div>
  );
};

export default Setup;

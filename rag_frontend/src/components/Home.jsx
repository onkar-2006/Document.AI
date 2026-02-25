import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Link, Youtube } from 'lucide-react';

const Home = ({ setSource }) => {
  const navigate = useNavigate();

  const handleSelect = (type) => {
    setSource(type);
    navigate('/setup');
  };

  return (
    <div className="fullscreen-center bg-gradient">
      <div className="hero-section">
        <h1 className="hero-title">Enterprise RAG</h1>
        <p className="hero-subtitle">Choose your knowledge source.</p>
        <div className="selection-grid">
          <button onClick={() => handleSelect('file')} className="card-item">
            <div className="icon-wrapper icon-blue"><FileText size={40} /></div>
            <h3 className="card-title">Document</h3>
          </button>
          <button onClick={() => handleSelect('web')} className="card-item">
            <div className="icon-wrapper icon-dark"><Link size={40} /></div>
            <h3 className="card-title">Website</h3>
          </button>
          <button onClick={() => handleSelect('youtube')} className="card-item">
            <div className="icon-wrapper icon-red"><Youtube size={40} /></div>
            <h3 className="card-title">YouTube</h3>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Setup from './Setup';
import Chat from './Chat';
import "./Chatinterface.css";

function App() {
  const [source, setSource] = useState(null); 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home setSource={setSource} />} />
        <Route path="/setup" element={<Setup source={source} />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
/**
 * Initial sample, for reading Vite's env mainly
 */

// src/Components/CuteChatbot.js
import { useState } from 'react';

const CuteChatbot = () => {
  const [open, setOpen] = useState(false);

  // Read .env
  const openaiApiUrl   = import.meta.env.VITE_OPENAI_API_URL;
  // const openaiApiKey   = import.meta.env.VITE_OPENAI_API_KEY;
  // const openaiModel    = import.meta.env.VITE_OPENAI_MODEL;
  // const deepseekApiUrl = import.meta.env.VITE_DEEPSEEK_API_URL;
  // const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  // const deepseekModel  = import.meta.env.VITE_DEEPSEEK_MODEL;

  // TODO: Delete after test purpose
  console.log('OpenAI API URL:', openaiApiUrl);

  return (
    <div>
      {/* Button to open */}
      <button
        className="btn btn-primary rounded-circle position-fixed"
        style={{ bottom: '20px', right: '20px', width: '60px', height: '60px' }}
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-chat-dots-fill" style={{ fontSize: '1.5rem' }}></i>
      </button>

      {/* Inner components here */}
      {open && (
        <div
          className="card position-fixed"
          style={{
            bottom: '90px',
            right: '20px',
            width: '300px',
            boxShadow: '0px 0px 10px rgba(0,0,0,0.2)'
          }}
        >
          {/* In-window component */}
          <h1>Hello world</h1>
          <p>, I love RUSTTTTTT! This is the sample chatpage should be.</p>
        </div>
      )}
    </div>
  );
};

export default CuteChatbot;

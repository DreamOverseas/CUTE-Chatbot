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
        className="btn btn-primary rounded-circle position-fixed bottom-5 right-5 w-16 h-16"
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-chat-dots-fill" style={{ fontSize: '1.5rem' }}></i>
      </button>

      {/* Inner components here */}
      {open && (
        <div
          className="card position-fixed bottom-24 right-5 w-96 min-h-3/4 max-h-3/4 shadow-md"
        >
          {/* In-window component */}
          <h1>Hello world</h1>
          <p>, I love RUSTTTTTT! This is where the sample chatpage should be.</p>
          <input type="text" id="user message" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 absolute inset-x-0 bottom-2 left-2 right-2" placeholder="Write a messager..." required />
        </div>
      )}
    </div>
  );
};

export default CuteChatbot;

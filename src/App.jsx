import { useState } from 'react'
import reactLogo from '/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import CuteChatbot from './Component/CuteChatbot.jsx';

function App() {
  const [count, setCount] = useState(0)

    // Reading from env
    const openaiApiUrl = import.meta.env.VITE_OPENAI_API_URL;
    const openaiAsstId = import.meta.env.VITE_OPENAI_ASST_ID;
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    // const openaiModel      = import.meta.env.VITE_OPENAI_MODEL;
    // const deepseekApiUrl   = import.meta.env.VITE_DEEPSEEK_API_URL;
    // const deepseekApiKey   = import.meta.env.VITE_DEEPSEEK_API_KEY;
    // const deepseekModel    = import.meta.env.VITE_DEEPSEEK_MODEL;
    const googleApiKey = import.meta.env.VITE_GOOGLE_API;

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>


      <CuteChatbot 
        nickname="UNCUTE Chatbot"
        openai_api_url={openaiApiUrl}
        openai_asst_id={openaiAsstId}
        openai_api_key={openaiApiKey}
        google_api_key={googleApiKey}
      />
    </>
  )
}

export default App

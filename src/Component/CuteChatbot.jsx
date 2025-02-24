/**
 * Initial sample, for reading Vite's env mainly
 */

// src/Components/CuteChatbot.js
import { useState, useEffect } from 'react';


const CuteChatbot = () => {
  const [open, setOpen] = useState(false);

  // Read .env
  const openaiApiUrl   = import.meta.env.VITE_OPENAI_API_URL;
  const openaiAsstId = import.meta.env.VITE_OPENAI_ASST_ID;
  const openaiApiKey     = import.meta.env.VITE_OPENAI_API_KEY;
  // const openaiModel      = import.meta.env.VITE_OPENAI_MODEL;
  // const deepseekApiUrl   = import.meta.env.VITE_DEEPSEEK_API_URL;
  // const deepseekApiKey   = import.meta.env.VITE_DEEPSEEK_API_KEY;
  // const deepseekModel    = import.meta.env.VITE_DEEPSEEK_MODEL;

  const [assistant, setAssistant] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Loading all nessesary data
  useEffect(() => {
    const initializeChatbot = async () => {
      try {
        setLoading(true);

        // Assistant Detail - CUTE Chatbot (formerly DO Copilot)
        const assistantResponse = await fetch(
          `${openaiApiUrl}/v1/assistants/${openaiAsstId}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json",
              "OpenAI-Beta": "assistants=v2",
            },
          }
        );

        if (!assistantResponse.ok) {
          console.err("Assistent API response error.");
          throw new Error("Failed to fetch assistant details");
        }

        const assistantData = await assistantResponse.json();
        setAssistant(assistantData);

        // New Thread
        const threadResponse = await fetch(
          `${openaiApiUrl}/v1/threads`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json",
              "OpenAI-Beta": "assistants=v2",
            },
            body: JSON.stringify({}),
          }
        );

        if (!threadResponse.ok) {
          throw new Error("Failed to create thread");
        }

        const threadData = await threadResponse.json();
        setThreadId(threadData.id);

      } catch (err) {
        console.error("Error initializing chatbot:", err);
      } finally {
        
        setLoading(false);
      }
    };

    initializeChatbot();
  }, []);

  const testButtonFunc = () => {
    console.log("Assistant found:");
    console.log(assistant);
    console.log(`and thread ${threadId} created.`);
  }

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

          {loading ? 
          (<p>We are getting your CUTE Chatbot ready, please wait...</p>)
          :
          ( // Main Display
            <div>
              <h1>Hello world</h1>
              <button onClick={testButtonFunc}> Test </button>   {/*TODO: Del for test purpose*/}
            </div>
          )}
          <input type="text" id="user message" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 absolute inset-x-0 bottom-2 left-2 right-2" placeholder="Write a messager..." required />
        </div>
      )}
    </div>
  );
};

export default CuteChatbot;

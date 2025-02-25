/**
 * Initial sample, for reading Vite's env mainly
 */

// src/Components/CuteChatbot.js
import { useState, useEffect } from 'react';


const CuteChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);
  const [input, setInput] = useState("");

  const openaiApiUrl = import.meta.env.VITE_OPENAI_API_URL;
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

  // const testButtonFunc = () => {
  //   console.log("Assistant found:");
  //   console.log(assistant);
  //   console.log(`and thread ${threadId} created.`);
  // }
  // Send message to Assistant
  const sendMessageToAssistant = async (userMessage) => {
    if (!threadId) {
      console.error("No thread ID found, cannot send message.");
      return;
    }

    try {
      // Add user message to chat
      setMessages((prev) => [...prev, userMessage]);

      // Send message to OpenAI API
      const messageResponse = await fetch(
        `${openaiApiUrl}/v1/threads/${threadId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2",
          },
          body: JSON.stringify({
            role: "user",
            content: userMessage,
          }),
        }
      );

      if (!messageResponse.ok) {
        throw new Error("Failed to send message");
      }

      const messageData = await messageResponse.json();
      console.log("Message sent:", messageData);

      // Run the Assistant
      const runResponse = await fetch(
        `${openaiApiUrl}/v1/threads/${threadId}/runs`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2",
          },
          body: JSON.stringify({
            assistant_id: openaiAsstId,
          }),
        }
      );

      if (!runResponse.ok) {
        throw new Error("Failed to run assistant");
      }

      const runData = await runResponse.json();
      console.log("Run started:", runData);

      // Poll for completion
      let runCompleted = false;
      let aiResponse = "";

      while (!runCompleted) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

        const runStatusResponse = await fetch(
          `${openaiApiUrl}/v1/threads/${threadId}/runs/${runData.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json",
              "OpenAI-Beta": "assistants=v2",
            },
          }
        );

        if (!runStatusResponse.ok) {
          throw new Error("Failed to get run status");
        }

        const runStatusData = await runStatusResponse.json();
        console.log("Run status:", runStatusData);

        if (runStatusData.status === "completed") {
          runCompleted = true;

          // Fetch messages
          const messagesResponse = await fetch(
            `${openaiApiUrl}/v1/threads/${threadId}/messages`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${openaiApiKey}`,
                "Content-Type": "application/json",
                "OpenAI-Beta": "assistants=v2",
              },
            }
          );

          if (!messagesResponse.ok) {
            throw new Error("Failed to fetch messages");
          }

          const messagesData = await messagesResponse.json();
          console.log("Messages data:", messagesData);

          // Extract the latest AI message
          const latestAiMessage = messagesData.data
            .filter((msg) => msg.role === "assistant")
            .pop();

          if (latestAiMessage) {
            aiResponse = latestAiMessage.content[0].text.value;
            setAiMessages((prev) => [...prev, aiResponse]);
            console.log("AI Response:", aiResponse);
          }
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      sendMessageToAssistant(input.trim());
      setInput("");
    }
  };

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
          id="chat card"
          className="card position-fixed bottom-24 right-5 w-96 min-h-3/4 max-h-3/4 shadow-md"
        >
          {/* In-window component */}

          {loading ? 
          (<p>We are getting your CUTE Chatbot ready, please wait...</p>)
          :
          ( // Main Display
            <div>
              <h1>Hello world</h1>
              {/* <button onClick={testButtonFunc}> Test </button>   TODO: Del for test purpose */}
            </div>
          )}
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-2">
            {messages.map((msg, index) => (
              <div key={index} className="flex justify-end my-1">
                <div className="border-2 border-blue-400 rounded-lg p-2 max-w-2/3 bg-blue-100 text-blue-900 break-words">
                  {msg}
                </div>
              </div>
            ))}
            {aiMessages.map((msg, index) => (
              <div key={index} className="flex justify-start my-1">
                <div className="border-2 border-gray-400 rounded-lg p-2 max-w-2/3 bg-gray-100 text-gray-900 break-words">
                  {msg}
                </div>
              </div>
            ))}
          </div>

          {/* Input Field */}
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full"
            placeholder="Write a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      )}
    </div>
  );
};

export default CuteChatbot;

/**
 * Initial sample, for reading Vite's env mainly
 */

// src/Components/CuteChatbot.js
import { useState, useEffect } from 'react';

import useSpeechToText from 'react-hook-speech-to-text';

const CuteChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState(["您好，请问我有什么可以帮您的？Good'ay. How can I help you today?"]);
  const [input, setInput] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // For the send button

  const openaiApiUrl = import.meta.env.VITE_OPENAI_API_URL;
  const openaiAsstId = import.meta.env.VITE_OPENAI_ASST_ID;
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  // const openaiModel      = import.meta.env.VITE_OPENAI_MODEL;
  // const deepseekApiUrl   = import.meta.env.VITE_DEEPSEEK_API_URL;
  // const deepseekApiKey   = import.meta.env.VITE_DEEPSEEK_API_KEY;
  // const deepseekModel    = import.meta.env.VITE_DEEPSEEK_MODEL;
  const googleApiKey = import.meta.env.VITE_GOOGLE_API;

  // const [assistant, setAssistant] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);

  // Loading all nessesary data
  useEffect(() => {
    const initializeChatbot = async () => {
      try {
        setLoading(true);

        // Assistant Detail - CUTE Chatbot (formerly DO Copilot)
        // const assistantResponse = await fetch(
        //   `${openaiApiUrl}/v1/assistants/${openaiAsstId}`,
        //   {
        //     method: "GET",
        //     headers: {
        //       "Authorization": `Bearer ${openaiApiKey}`,
        //       "Content-Type": "application/json",
        //       "OpenAI-Beta": "assistants=v2",
        //     },
        //   }
        // );

        // if (!assistantResponse.ok) {
        //   console.error("Assistent API response error.");
        //   throw new Error("Failed to fetch assistant details");
        // }

        // const assistantData = await assistantResponse.json();
        // setAssistant(assistantData);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Configs - USE react-hook-speech-to-text / Google Cloud API to TTS
  const {
    error,
    isRecording,
    results,
    interimResult,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    speechRecognitionProperties: {
      interimResults: true // Allows for displaying real-time speech results
    },
    googleCloudRecognitionConfig: {
      languageCode: 'en-US',
      alternativeLanguageCodes: ['zh-CN'],
    },
    continuous: true,
    maxAlternatives: 1,
    crossBrowser: true,
    googleApiKey: googleApiKey,
    useLegacyResults: false
  });

  // Monitor interimResult / results，update when awaked
  useEffect(() => {
    if (interimResult) {
      setInput(interimResult);
    }
    else if (results.length > 0) {
      const lastTranscript = results[results.length - 1].transcript;
      setInput(lastTranscript);
    }
  }, [interimResult, results]);

  const handleRecordClick = () => {
    if (!isRecording) {
      startSpeechToText();
    } else {
      stopSpeechToText();
    }
  };

  if (error) { console.error(error) };

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
    // Start thinking
    setAiThinking(true);

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
      console.log("Message sent:", messageData); //TODO: Delete for test purpose

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
      console.log("Run started:", runData);//TODO: Delete for test purpose

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
        console.log("Run status:", runStatusData);//TODO: Delete for test purpose

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
          console.log("Messages data:", messagesData);//TODO: Delete for test purpose

          // Extract the latest AI message
          const latestAiMessage = messagesData.data
            .filter((msg) => msg.role === "assistant")[0];

          if (latestAiMessage) {
            aiResponse = latestAiMessage.content[0].text.value;
            setAiMessages((prev) => [...prev, aiResponse]);

            console.log("AI Response:", aiResponse);//TODO: Delete for test purpose
          }
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
    finally { setAiThinking(false); } // Stop Thinking
  };

  const sendNow = () => {
    sendMessageToAssistant(input.trim());
    setInput("");
    if (isRecording) {
      stopSpeechToText();
    } 
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      sendNow();
    }
  };

  // Modify the open button click handler to handle animations
  const toggleChat = () => {
    if (open) {
      // Start the fade-out animation first
      setIsVisible(false);
      // Then close the chat after animation completes
      setTimeout(() => {
        setOpen(false);
      }, 300); // Match this to your transition duration
    } else {
      // Open the chat first
      setOpen(true);
      // Then start the fade-in animation
      setTimeout(() => {
        setIsVisible(true);
      }, 10); // Small delay to ensure DOM update
    }
  };

  return (
    <div>
      {/* Button to open */}
      <button
        className="btn btn-primary rounded-circle position-fixed bottom-5 right-5 w-16 h-16 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:rotate-12 focus:outline-none"
        onClick={toggleChat}
      >
        <i className="bi bi-chat-dots-fill" style={{ fontSize: '1.5rem' }}></i>
      </button>


      {/* Inner components here */}
      {open && (
        <div
          id="chat card"
          className={`card position-fixed bottom-24 right-5 w-96 max-w-[90%] min-h-3/4 max-h-3/4 shadow-md lg:w-1/3 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* In-window component */}

          {loading ?
            (<p>We are getting your CUTE Chatbot ready, please wait...</p>)
            :
            ( // Main Display
              <div>
                <h1>CUTE Chatbot</h1>
                {/* <button onClick={testButtonFunc}> Test </button>   TODO: Del for test purpose */}
              </div>
            )}
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-2">
            {(() => {
              // Show combined mesaage alternately from CUTE's greetings settled at useState
              const combined = [];
              const maxLength = Math.max(aiMessages.length, messages.length);
              for (let i = 0; i < maxLength; i++) {
                if (i < aiMessages.length) {
                  combined.push(
                    <div key={`ai-${i}`} className="flex justify-start my-1">
                      <div className="border-2 border-gray-400 rounded-lg p-2 max-w-2/3 bg-gray-100 text-gray-900 break-words">
                        {aiMessages[i]}
                      </div>
                    </div>
                  );
                }
                if (i < messages.length) {
                  combined.push(
                    <div key={`user-${i}`} className="flex justify-end my-1">
                      <div className="border-2 border-blue-400 rounded-lg p-2 max-w-2/3 bg-blue-100 text-blue-900 break-words">
                        {messages[i]}
                      </div>
                    </div>
                  );
                }
              }
              return combined;
            })()}
          </div>

          {/* Input Field */}
          {aiThinking ? (
            <div className="flex items-center">
              <div className='relative w-full'>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 w-full opacity-50 cursor-not-allowed"
                  placeholder="Thinking Hard..."
                  value="Thinking Hard..."
                  disabled
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-gray-400 animate-spin fill-gray-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                </div>
              </div>
              <button
                disabled
                className="p-2 text-green-500 cursor-not-allowed border-0 outline-none focus:outline-none"
              >
                <i className="bi bi-send-check-fill text-xl"></i>
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              {/* Start STT */}
              <button
                onClick={handleRecordClick}
                className={`mr-2 focus:outline-none ${isRecording ? 'text-red-500' : 'text-gray-500'}`}
              >
                <i className={isRecording ? "bi bi-record-circle-fill" : "bi bi-record-circle"}></i>
              </button>
              {/* Input box */}
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full"
                placeholder="Write a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {/* Send Button */}
              <button
                onClick={sendNow}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors border-0 outline-none focus:outline-none"
              >
                {isHovered ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-send-fill text-xl"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
                  </svg>
                ) : (
                  <i className="bi bi-send text-xl"></i>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CuteChatbot;

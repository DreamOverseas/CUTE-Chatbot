// Tailwind style import
import './CuteChatbot.css'

// src/Components/CuteChatbot.js
import { useState, useEffect } from 'react';
import useSpeechToText from 'react-hook-speech-to-text';
import { useSpeechSynthesis } from 'react-speech-kit';

import LanguageSelector from './LanguageSelector';
import { speakWithGoogle } from '../utils/GoogleTTS';
import ToggleVoiceBtn from './VoicedBtn';

import ChatIcon from '../assets/chat.svg?react'

let useGoogleTTS = true; // configure if Google TTS is being used

// eslint-disable-next-line react/prop-types
const CuteChatbot = ({ nickname, openai_api_url, openai_asst_id, openai_api_key, google_api_key }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState(["您好，请问我有什么可以帮您的？ Good'ay. How can I help you today?"]);
  const [input, setInput] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isSttHovered, setIsSttHovered] = useState(false);
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [doWeSpeak, setDoWeSpeak] = useState(true);

  const [currLang, setCurrLang] = useState('zh-CN'); // Language code in BCP-47 (e.g. en-US, zh-CN ...)

  const { speak, voices } = useSpeechSynthesis({});            // Voice Synthesis using Web Speech API
  const selectedVoice = voices.find((voice) => voice.lang === currLang);

  // Reading from props only
  const openaiApiUrl = openai_api_url;
  const openaiAsstId = openai_asst_id;
  const openaiApiKey = openai_api_key;
  const googleApiKey = google_api_key;

  // const [assistant, setAssistant] = useState(null);
  const [threadId, setThreadId] = useState(null);
  // const [assistant, setAssistant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);

  // Loading all nessesary data
  useEffect(() => {
    if (!googleApiKey || !openaiApiKey || !openaiAsstId || !openaiApiUrl) return;
    let isMounted = true;
    const initializeChatbot = async () => {
      console.log("Your assistant is ready.");
      try {
        setLoading(true);

        // Assistant Detail - CUTE Chatbot (formerly DO Copilot) TODO: Commented for API Update
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
        // if (isMounted) setAssistant(assistantData);

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
        const ThreadContentType = threadResponse.headers.get("content-type");
        if (threadResponse.status !== 204 && ThreadContentType && ThreadContentType.includes("application/json")) {
          const threadData = await threadResponse.json();
          if (isMounted) setThreadId(threadData.id);
        }

      } catch (err) {
        console.error("Error initializing chatbot:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeChatbot();
    return () => { isMounted = false };
  }, [googleApiKey, openaiApiKey, openaiApiUrl, openaiAsstId]);

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
      lang: currLang,
      interimResults: true // Allows for displaying real-time speech results
    },
    googleCloudRecognitionConfig: {
      languageCode: currLang,
      alternativeLanguageCodes: ['en-US', 'zh-CN'],
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

  const handleRecordStart = () => {
    if (!isRecording) {
      startSpeechToText();
    }
  };

  const handleRecordStop = () => {
    if (isRecording) {
      stopSpeechToText();
    }
  };

  if (error) { console.error(error) };

  // Speaks out a text with current settings
  const letBotSpeak = (script, locale) => {
    if (useGoogleTTS && googleApiKey) {
      speakWithGoogle(script, locale, googleApiKey)
    }
    else {
      speak({ text: script, voice: selectedVoice });
    }
  }

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

      // const messageData = await messageResponse.json();

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

          // Extract the latest AI message
          const latestAiMessage = messagesData.data
            .filter((msg) => msg.role === "assistant")[0];

          if (latestAiMessage) {
            aiResponse = latestAiMessage.content[0].text.value;
            setAiMessages((prev) => [...prev, aiResponse]);
            if (doWeSpeak) letBotSpeak(aiResponse, currLang); // If the speaking function is open, let bot speak
          }
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
    finally { setAiThinking(false); } // Stop Thinking
  };

  const sendNow = () => {
    if (!input) return;
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
      {/* Button to open chat */}
      <button
        onClick={toggleChat}
        className="!bg-blue-500 !w-16 !h-16 !rounded-full !flex !items-center !justify-center focus:outline-none !transform hover:rotate-6 !transition !duration-300 !fixed !bottom-4 !right-4 !z-50"
      >
        <ChatIcon alt="Chat Now" className="w-8 h-8 !fill-current !text-white" />
      </button>

      {/* Card Contents */}
      {open && (
        <div
          id="chat-card"
          className={`!fixed !bottom-24 !right-5 !w-[600px] !max-w-[90%] !min-h-[75%] !max-h-[75%] !bg-white !shadow-md !rounded-lg !flex !flex-col !transition-opacity !duration-300 !ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Info msgs */}
          {loading ? (
            <p className="!p-4">We are getting your CUTE Chatbot ready, please wait...</p>
          ) : (
            <div className="!flex !items-center !justify-between !p-4">
              <h3 className="!text-xl !font-bold">
                {nickname}
              </h3>
              <div className="flex items-center">
                <ToggleVoiceBtn speakOrNot={doWeSpeak} setSpeakOrNot={setDoWeSpeak} />
                <LanguageSelector currLang={currLang} setCurrLang={setCurrLang} />
              </div>
            </div>
          )}

          {/* Chat messgaes display area */}
          <div className="!flex-1 !overflow-y-auto !px-4">
            {(() => {
              const combined = [];
              const maxLength = Math.max(aiMessages.length, messages.length);
              for (let i = 0; i < maxLength; i++) {
                if (i < aiMessages.length) {
                  combined.push(
                    <div key={`ai-${i}`} className="flex justify-start !my-1">
                      <div className="!border-2 !border-gray-400 !rounded-lg !p-2 !max-w-2/3 !bg-gray-100 !text-gray-900 !break-words">
                        {aiMessages[i]}
                      </div>
                    </div>
                  );
                }
                if (i < messages.length) {
                  combined.push(
                    <div key={`user-${i}`} className="!flex !justify-end !my-1">
                      <div className="!border-2 !border-blue-400 !rounded-lg !p-2 !max-w-2/3 !bg-blue-100 !text-blue-900 !break-words">
                        {messages[i]}
                      </div>
                    </div>
                  );
                }
              }
              return combined;
            })()}
          </div>

          {/* Input areas */}
          <div className="!p-4 !border-t !border-gray-200">
            {aiThinking ? (
              <div className="!flex !items-center">
                <div className="relative w-full">
                  <input
                    type="text"
                    className="!bg-gray-50 border !border-gray-300 !text-gray-900 !text-sm !rounded-lg !p-2.5 !w-full !opacity-50 !cursor-not-allowed"
                    placeholder="Thinking Hard..."
                    value="Thinking Hard..."
                    disabled
                  />
                  <div className="!absolute !right-3 !top-1/2 !transform !-translate-y-1/2">
                    <svg
                      aria-hidden="true"
                      className="!w-5 !h-5 !text-gray-400 !animate-spin !fill-gray-600"
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
                  className="!p-2 !text-green-500 !cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="!ml-2 !mr-2 !w-6 !h-6"
                  >
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="!flex !items-center">
                <button
                  onMouseDown={handleRecordStart}
                  onMouseUp={handleRecordStop}
                  onMouseLeave={() => {
                    setIsSttHovered(false);
                    handleRecordStop();
                  }}
                  onTouchStart={handleRecordStart}
                  onTouchEnd={handleRecordStop}
                  onMouseEnter={() => setIsSttHovered(true)}
                  className={`!mr-2 !focus:outline-none ${isRecording ? '!text-red-500' : isSttHovered ? '!text-blue-600' : '!text-gray-500'
                    }`}
                >
                  {isRecording || isSttHovered ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="!w-6 !h-6"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="5" fill="white" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="!w-6 !h-6"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                {/* Input field */}
                <input
                  type="text"
                  className="!bg-gray-50 border !border-gray-300 !text-gray-900 !text-sm !rounded-lg !focus:ring-blue-500 !focus:border-blue-500 !block !p-2.5 !w-full"
                  placeholder="Write a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                {/* Send button */}
                <button
                  onClick={sendNow}
                  className={`!ml-2 !focus:outline-none ${isSendHovered ? '!text-blue-600' : '!text-gray-500'
                    }`}
                  onMouseEnter={() => setIsSendHovered(true)}
                  onMouseLeave={() => setIsSendHovered(false)}
                >
                  {isSendHovered ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="!w-6 !h-6"
                    >
                      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="!w-6 !h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2 21l21-9L2 3v7l15 2-15 2v7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CuteChatbot;

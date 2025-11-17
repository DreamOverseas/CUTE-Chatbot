// Tailwind style import
import './CuteChatbot.css'

// src/Components/CuteChatbot.js
import { useState, useEffect } from 'react';
import useSpeechToText from 'react-hook-speech-to-text';
import { useSpeechSynthesis } from 'react-speech-kit';

import LanguageSelector from './LanguageSelector';
import { sendMessageToAssistant, sendMessageToBackend } from '../utils/ConnectLLM';
import { speakWithGoogle } from '../utils/GoogleTTS';
import ToggleVoiceBtn from './VoicedBtn';
import VoiceLoader from './RecordLoader';
import ChatIcon from '../assets/chat.svg?react'

let useGoogleTTS = true; // configure if Google TTS is being used

// eslint-disable-next-line react/prop-types
const CuteChatbot = ({ nickname, openai_api_url, openai_asst_id, openai_api_key, google_api_key, backend_url }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState(["您好，请问我有什么可以帮您的？ G'day. How can I help you today?"]);
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
  const backendURL = backend_url;

  // const [assistant, setAssistant] = useState(null);
  const [threadId, setThreadId] = useState(null);
  // const [assistant, setAssistant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  // Loading all nessesary data
  useEffect(() => {
    if (!googleApiKey) return;
    if (!backendURL) {
      if (!openaiApiUrl || !openaiApiKey || !openaiAsstId) return;
    }
    let isMounted = true;

    if (backendURL) { // For direct connect to backend
      setLoading(false);
      console.log("Your chatbot is ready to connect with the server.");
      return () => { isMounted = false };
    }

    const initializeChatbot = async () => {
      try {
        setLoading(true);

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
        console.log("Your assistant is ready.");
      }
    };

    initializeChatbot();
    return () => { isMounted = false };
  }, [backendURL, googleApiKey, openaiApiKey, openaiApiUrl, openaiAsstId]);

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
    const scriptToRead = script
      .replace(/https?:\/\/[^\s]+/g, '')// Remove https//
      .replace(/[(){}[\]]/g, '')        // Remove all brackets
      .replace(/:/g, ' ');             // All columns to white space

    if (useGoogleTTS && googleApiKey) {
      speakWithGoogle(scriptToRead, locale, googleApiKey)
    }
    else {
      speak({ text: scriptToRead, voice: selectedVoice });
    }
  }

  const sendNow = () => {
    if (!input) return;
    if (!backendURL) sendMessageToAssistant(input.trim(), openaiApiUrl, openaiApiKey, openaiAsstId, threadId, setAiThinking, setMessages, setAiMessages, setIsSendHovered, currLang, doWeSpeak, letBotSpeak);
    else sendMessageToBackend(input.trim(), backendURL, setAiThinking, setMessages, setAiMessages, setIsSendHovered, currLang, doWeSpeak, letBotSpeak);
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
          className={`!z-10 !fixed !bottom-24 !right-5 !w-[600px] !max-w-[90%] !min-h-[75%] !max-h-[75%] !bg-white !shadow-md !rounded-lg !flex !flex-col !transition-opacity !duration-300 !ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Info msgs */}
          {loading ? (
            <p className="!p-4">We are getting your CUTE Chatbot ready, please wait...</p>
          ) : (
            <div className="!flex !items-center !justify-between !p-4">
              <h3 className="!text-xl !font-bold">
                {nickname || "CUTE Chatbot"}
              </h3>
              <div className="flex items-center">
                <ToggleVoiceBtn speakOrNot={doWeSpeak} setSpeakOrNot={setDoWeSpeak} />
                <LanguageSelector currLang={currLang} setCurrLang={setCurrLang} />
              </div>
            </div>
          )}

          {/* Chat messgaes display area */}
          <div className="!flex-1 !overflow-y-auto !px-4 !relative">
            {isRecording && (
              <div className="!absolute !inset-0 !flex !items-center !justify-center">
                <VoiceLoader />
              </div>
            )}
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

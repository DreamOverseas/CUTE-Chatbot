// TODO: Connect to V-db and run retrievals


// Connect to LLM with message construction
export async function sendMessageToLLM(userMessage, setAiThinking, setMessages, setIsSendHovered, currLang) {
    // Start thinking
    setAiThinking(true);

    try {
      // Add user message to chat
      setMessages((prev) => [...prev, userMessage]);

      const userMessageWithPrompt = `${userMessage} 
      Please answer my questions in structured locale ${currLang} language.
      If no relevant information is found in the retrieved documents, state clearly: "I cannot provide specific details from my knowledge." 
      Do not generate additional unrelated text.
      Also provide me website link from your knowledge base if you suggest me to visit.`;

      // TODO: Send message to OpenAI API
      console.log("Constructed Message: ", userMessageWithPrompt);

    } catch (err) {
      console.error("Error sending message:", err);
    }
    finally { 
      setAiThinking(false);
      setIsSendHovered(false);
     } // Stop Thinking
  };

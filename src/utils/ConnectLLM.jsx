// Connect to LLM with message construction
export async function sendMessageToAssistant(userMessage, openaiApiUrl, openaiApiKey, openaiAsstId, threadId, setAiThinking, setMessages, setAiMessages, setIsSendHovered, currLang, doWeSpeak, letBotSpeak) {
  if (!threadId) {
    console.error("No thread ID found, cannot send message.");
    return;
  }
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
          content: userMessageWithPrompt,
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
          const aiResponseRaw = latestAiMessage.content[0].text.value;
          aiResponse = aiResponseRaw.replace(/\s*【\d+:\d+†source】/g, '').trim(); // Remove possible source links like "【8:0†source】"
          setAiMessages((prev) => [...prev, aiResponse]);
          if (doWeSpeak) letBotSpeak(aiResponse, currLang); // If the speaking function is open, let bot speak
        }
      }
    }
  } catch (err) {
    console.error("Error sending message:", err);
  }
  finally { 
    setAiThinking(false);
    setIsSendHovered(false);
   } // Stop Thinking
};


// Send/Get message from the backend url given in /chat
export async function sendMessageToBackend(userMessage, backendURL, setAiThinking, setMessages, setAiMessages, setIsSendHovered, currLang, doWeSpeak, letBotSpeak) {
  console.log("Sending message to backend.");
  setAiThinking(true);

  try {
    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);

    // Send message to OpenAI API
    const messageResponse = await fetch(backendURL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // llm: "ChatGPT",
          question: userMessage,
        }),
      }
    );

    if (!messageResponse.ok) {
      throw new Error("Failed to send message");
    }

    const messageData = await messageResponse.json()

    if (messageData) {
      const aiResponseRaw = messageData.answer;
      const aiResponse = aiResponseRaw.replace(/\s*【\d+:\d+†source】/g, '').trim(); // Remove possible source links like "【8:0†source】"
      setAiMessages((prev) => [...prev, aiResponse]);
      if (doWeSpeak) letBotSpeak(aiResponse, currLang); // If the speaking function is open, let bot speak
    }
  } catch (err) {
    console.error("Error sending message to Backend:", err);
  }
  finally { 
    setAiThinking(false);
    setIsSendHovered(false);
   } // Stop Thinking
}

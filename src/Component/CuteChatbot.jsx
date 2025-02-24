import { useState } from "react";

const CuteChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      // Add new message to state
      setMessages([...messages, input]);
      setInput(""); // Clear input field
    }
  };

  return (
    <div>
      {/* Button to open */}
      <button
        className="btn btn-primary rounded-circle position-fixed bottom-5 right-5 w-16 h-16"
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-chat-dots-fill" style={{ fontSize: "1.5rem" }}></i>
      </button>

      {/* Chat Window */}
      {open && (
        <div
          id="chat card"
          className="card position-fixed bottom-24 right-5 min-h-3/4 max-h-3/4 shadow-md w-[90%] h-[75vh] lg:w-1/3 lg:h-96 p-4 flex flex-col"
        >
          <h1 className="text-xl font-bold mb-2">Chat</h1>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-2">
            {messages.map((msg, index) => (
              <div
              key={index}
              className="flex justify-end my-1"
            >
              <div className="border-2 border-blue-400 rounded-lg p-2 max-w-2/3 bg-blue-100 text-blue-900 break-words">
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

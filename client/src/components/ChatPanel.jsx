import { useState } from "react";

export default function ChatPanel({ socket, messages, connections }) {
  const [text, setText] = useState("");

  const isConnected = connections.length > 0;

  const handleSend = () => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage || !socket || !isConnected) return;

    socket.emit("chat:message", {
      text: trimmedMessage,
    });

    setText("");
  };

  return (
    <div className="w-80 h-full bg-gray-900 border-l border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-white font-semibold">Chat</h2>
        {isConnected ? (
          <p className="text-xs text-gray-400 mt-1">
            Connected with: {connections.map((c) => c.name).join(", ")}
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            Chat is enabled only in proximity
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isConnected ? (
          messages?.map((msg, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-3">
              <p className="text-purple-400 text-sm font-medium">
                {msg.username}
              </p>
              <p className="text-white text-sm">{msg.text}</p>
              <p className="text-gray-400 text-xs">{msg.time}</p>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center px-6 text-center">
            <div>
              <p className="text-gray-300 text-lg font-medium">
                No nearby connections
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Move closer to another player to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={!isConnected}
          placeholder={
            isConnected ? "Type a message..." : "Move closer to chat..."
          }
          className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 outline-none disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={!isConnected}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
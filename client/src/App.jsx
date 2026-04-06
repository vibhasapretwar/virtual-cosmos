import { useState } from "react";
import UsernameModal from "./components/UsernameModal";
import GameCanvas from "./components/GameCanvas";
import ChatPanel from "./components/ChatPanel";
import useSocket from "./hooks/useSocket";
// import useProximity from "./hooks/useProximity";

export default function App() {
  const [username, setUsername] = useState("");

  const { socket, messages, players, selfId, connections, toast, sendMove } =
    useSocket(username);

  if (!username) {
    return <UsernameModal onEnter={setUsername} />;
  }

  const isConnected = connections.length > 0;

  return (
    <div className="w-screen h-screen flex relative bg-[#0f1023]">
      {/* Game area */}
      <div className="flex-1 h-full relative min-w-0">
        <GameCanvas
          selfId={selfId}
          players={players}
          messages={messages}
          onMove={sendMove}
        />

        {isConnected && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600/90 backdrop-blur px-4 py-2 rounded-full text-white text-sm shadow-lg">
            Connected with: {connections.map((c) => c.name).join(", ")}
          </div>
        )}

        {toast && (
          <div
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-white text-sm shadow-lg backdrop-blur ${
              toast.type === "connected"
                ? "bg-emerald-600/90"
                : "bg-rose-600/90"
            }`}
          >
            {toast.text}
          </div>
        )}
      </div>

      {/* Chat sidebar */}
      {isConnected && (
        <div className="w-80 h-full shrink-0 border-l border-gray-800 bg-gray-900 z-40">
          <ChatPanel
            socket={socket}
            messages={messages}
            connections={connections}
          />
        </div>
      )}
    </div>
  );
}
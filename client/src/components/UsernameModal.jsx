import { useState } from "react";

export default function UsernameModal({ onEnter }) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-80 flex flex-col gap-4">
        <h1 className="text-white text-xl font-semibold">Enter the Cosmos</h1>
        <p className="text-gray-400 text-sm">
          Choose your display name to join.
        </p>

        <input
          autoFocus
          className="bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) {
              onEnter(name.trim());
            }
          }}
        />

        <button
          onClick={() => {
            if (name.trim()) {
              onEnter(name.trim());
            }
          }}
          className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg py-2 font-medium transition-colors"
        >
          Enter →
        </button>
      </div>
    </div>
  );
}
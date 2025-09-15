"use client"
"use client";

import React, { useState } from "react";
import { useChat } from "@/context/ChatContext";

export default function AppChatInput() {
  const [input, setInput] = useState("");
  const { sendStreamingMessage, isLoading } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    await sendStreamingMessage(message);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you want to do?"
          disabled={isLoading}
          className="w-full px-4 py-3 text-lg rounded-2xl focus:outline-none text-white bg-gray-800 border border-gray-600 focus:border-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </form>
  );
}

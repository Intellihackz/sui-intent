"use client";

import AppChatInput from "@/components/AppChatInput";
import AppHeader from "@/components/AppHeader";
import ChatContainer from "@/components/ChatContainer";

export default function Home() {
  return (
    <div className="h-screen flex flex-col px-2">
      <AppHeader />
      <ChatContainer />
      <div className="p-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <AppChatInput />
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useChat } from "@/context/ChatContext";
import { Plus, MessageSquare, Trash2 } from "lucide-react";

export function AppSidebar() {
  const { sessions, currentSessionId, createNewChat, loadSession, deleteSession } = useChat();

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  return (
    <Sidebar className="dark text-white">
      <SidebarHeader>
        <h1 className="text-3xl font-bold text-center border-b p-4">Intent</h1>
        <button
          onClick={createNewChat}
          className="flex items-center gap-2 w-full p-3 mt-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Chat
        </button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group ${
                  currentSessionId === session.id
                    ? 'bg-gray-700 text-white'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MessageSquare size={14} />
                  <span className="truncate text-sm">{session.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chat history yet</p>
              </div>
            )}
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <p className="truncate border px-4 py-2 rounded-2xl text-xs">
          0xdf337bb549e017330a4f3fc8a25f57c975b864d7c6665d73154b8ef3671e0c34
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}

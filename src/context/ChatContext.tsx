'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ChatMessage } from '@/types/chat';
import { useChatHistory } from '@/hooks/useChatHistory';

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  sendStreamingMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  // History methods
  sessions: any[];
  currentSessionId: string | null;
  createNewChat: () => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const history = useChatHistory();

  // Load current session messages when session changes
  useEffect(() => {
    const currentSession = history.getCurrentSession();
    if (currentSession) {
      setMessages(currentSession.messages);
    } else {
      setMessages([]);
    }
  }, [history.currentSessionId]);

  // Save messages to current session whenever messages change
  useEffect(() => {
    if (history.currentSessionId && messages.length > 0) {
      history.updateSession(history.currentSessionId, messages);
    }
  }, [messages, history.currentSessionId]);

  const sendMessage = async (content: string): Promise<void> => {
    // Create new session if none exists
    let sessionId = history.currentSessionId;
    if (!sessionId) {
      sessionId = history.createNewSession(content);
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, messages }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: data.id,
        content: data.message,
        role: 'assistant',
        timestamp: data.timestamp,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendStreamingMessage = async (content: string): Promise<void> => {
    // Create new session if none exists
    let sessionId = history.currentSessionId;
    if (!sessionId) {
      sessionId = history.createNewSession(content);
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessage: ChatMessage = {
      id: `assistant_${Date.now()}`,
      content: '',
      role: 'assistant',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) throw new Error('Failed to send streaming message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: msg.content + data.content }
                    : msg
                )
              );
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error with streaming message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    history.setCurrentSession(null);
    setMessages([]);
  };

  const loadSession = (sessionId: string) => {
    history.setCurrentSession(sessionId);
  };

  const deleteSession = (sessionId: string) => {
    history.deleteSession(sessionId);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      isLoading,
      sendMessage,
      sendStreamingMessage,
      clearMessages,
      sessions: history.sessions,
      currentSessionId: history.currentSessionId,
      createNewChat,
      loadSession,
      deleteSession,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
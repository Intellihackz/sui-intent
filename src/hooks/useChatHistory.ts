"use client";

import { useState, useEffect } from 'react';
import { ChatSession, ChatHistoryState } from '@/types/chatHistory';
import { ChatMessage } from '@/types/chat';

const STORAGE_KEY = 'sui-intent-chat-history';

export function useChatHistory() {
  const [state, setState] = useState<ChatHistoryState>({
    sessions: [],
    currentSessionId: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState(parsed);
      } catch (error) {
        console.error('Failed to parse chat history:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const createNewSession = (firstMessage?: string): string => {
    const sessionId = `session_${Date.now()}`;
    const title = firstMessage 
      ? firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '')
      : 'New Chat';

    const newSession: ChatSession = {
      id: sessionId,
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState(prev => ({
      sessions: [newSession, ...prev.sessions],
      currentSessionId: sessionId,
    }));

    return sessionId;
  };

  const updateSession = (sessionId: string, messages: ChatMessage[]) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId
          ? {
              ...session,
              messages,
              updatedAt: new Date().toISOString(),
            }
          : session
      ),
    }));
  };

  const deleteSession = (sessionId: string) => {
    setState(prev => ({
      sessions: prev.sessions.filter(s => s.id !== sessionId),
      currentSessionId: prev.currentSessionId === sessionId ? null : prev.currentSessionId,
    }));
  };

  const setCurrentSession = (sessionId: string | null) => {
    setState(prev => ({
      ...prev,
      currentSessionId: sessionId,
    }));
  };

  const getCurrentSession = (): ChatSession | null => {
    return state.sessions.find(s => s.id === state.currentSessionId) || null;
  };

  const clearAllHistory = () => {
    setState({
      sessions: [],
      currentSessionId: null,
    });
  };

  return {
    sessions: state.sessions,
    currentSessionId: state.currentSessionId,
    createNewSession,
    updateSession,
    deleteSession,
    setCurrentSession,
    getCurrentSession,
    clearAllHistory,
  };
}
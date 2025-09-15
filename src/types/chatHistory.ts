import { ChatMessage } from './chat';

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatHistoryState {
  sessions: ChatSession[];
  currentSessionId: string | null;
}
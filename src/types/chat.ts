export interface ChatMessage {
  id?: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  messages?: ChatMessage[];
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  message: string;
  timestamp: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}
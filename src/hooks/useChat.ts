"use client"
"use client";

import { useState } from 'react';
import { ChatMessage, ChatResponse, StreamChunk } from '@/types/chat';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string): Promise<void> => {
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

      const data: ChatResponse = await response.json();
      
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
              const data: StreamChunk = JSON.parse(line.slice(6));
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

  return {
    messages,
    isLoading,
    sendMessage,
    sendStreamingMessage,
    clearMessages: () => setMessages([]),
  };
}
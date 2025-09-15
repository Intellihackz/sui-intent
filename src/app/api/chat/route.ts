import { NextRequest, NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, messages } = await request.json();

    if (!message && !messages) {
      return NextResponse.json(
        { error: 'Message or messages array is required' },
        { status: 400 }
      );
    }

    // Format messages for Mistral API
    const mistralMessages = messages || [{ role: 'user', content: message }];

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: mistralMessages,
    });

    const response = {
      id: `msg_${Date.now()}`,
      message: chatResponse.choices?.[0]?.message?.content || 'No response',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Chat API is running',
    endpoints: {
      POST: '/api/chat - Send a chat message',
    },
  });
}
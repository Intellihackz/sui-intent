import { NextRequest } from "next/server";
import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, messages } = await request.json();

    if (!message && !messages) {
      return new Response("Message or messages array is required", {
        status: 400,
      });
    }

    // Format messages for Mistral API
    const mistralMessages = messages || [{ role: "user", content: message }];

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await client.chat.stream({
            model: "mistral-large-latest",
            messages: mistralMessages,
          });

          for await (const chunk of result) {
            const streamText = chunk.data.choices[0].delta.content;
            if (typeof streamText === "string") {
              const data = encoder.encode(
                `data: ${JSON.stringify({
                  content: streamText,
                  done: false,
                })}\n\n`
              );
              controller.enqueue(data);
            }
          }

          // Send completion signal
          const finalChunk = encoder.encode(
            `data: ${JSON.stringify({
              content: "",
              done: true,
            })}\n\n`
          );
          controller.enqueue(finalChunk);
          controller.close();
        } catch (error) {
          console.error("Mistral streaming error:", error);
          const errorChunk = encoder.encode(
            `data: ${JSON.stringify({
              error: "Streaming failed",
              done: true,
            })}\n\n`
          );
          controller.enqueue(errorChunk);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Streaming chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

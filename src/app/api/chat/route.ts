import { openrouter } from "@/lib/openrouter";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return Response.json(
        {
          error: "Message is required",
        },
        {
          status: 400,
        }
      );
    }

    const cleanMessage = message.trim();

    console.log(
      "Generating chat response:",
      cleanMessage
    );

    const result = await generateText({
      model: openrouter("openrouter/free"),

      system: `
You are a helpful AI assistant.

Answer the user's questions clearly and accurately.

Keep responses concise when the question is simple.
Give more detailed explanations when necessary.

Use Markdown when useful.
Do not unnecessarily repeat the user's question.
      `.trim(),

      prompt: cleanMessage,
    });

    if (!result.text?.trim()) {
      throw new Error(
        "The AI returned an empty response."
      );
    }

    console.log(
      "Chat response generated successfully"
    );

    return Response.json({
      type: "chat",
      reply: result.text,
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);

    let message = "AI request failed";

    if (error instanceof Error) {
      message = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      message = String(
        (error as { message: unknown }).message
      );
    }

    return Response.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}
import { openrouter } from "@/lib/openrouter";
import { parseCommand } from "@/lib/commands";
import { generateImage } from "@/lib/image-generator";

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
    const command = parseCommand(cleanMessage);

    // =====================================================
    // IMAGE GENERATION
    // =====================================================

    if (command.type === "image") {
      if (!command.prompt?.trim()) {
        return Response.json(
          {
            error: "Please provide an image prompt.",
          },
          {
            status: 400,
          }
        );
      }

      console.log(
        "Generating image:",
        command.prompt
      );

      const image = await generateImage(command.prompt);

      console.log(
        "Image generated successfully"
      );

      return Response.json({
        type: "image",
        prompt: command.prompt,
        image,
      });
    }

    // =====================================================
    
    // =====================================================
    // NORMAL QUESTION / ANSWER
    // =====================================================

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

      prompt: command.prompt?.trim() || cleanMessage,
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
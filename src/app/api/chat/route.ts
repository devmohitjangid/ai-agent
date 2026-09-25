import { openrouter } from "@/lib/openrouter";
import { parseCommand } from "@/lib/commands";
import { generateImage } from "@/lib/image-generator";
import { generateText } from "ai";
import { generateVoice } from "@/lib/voice-generator";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const command = parseCommand(message);

    // IMAGE
    if (command.type === "image") {
      if (!command.prompt) {
        return Response.json(
          { error: "Please provide an image prompt." },
          { status: 400 }
        );
      }

      console.log("Generating image:", command.prompt);

      const image = await generateImage(command.prompt);

      console.log("Image generated successfully");

      return Response.json({
        type: "image",
        prompt: command.prompt,
        image,
      });
    }

    // VOICE
    if (command.type === "voice") {
      if (!command.prompt) {
        return Response.json(
          { error: "Please provide text for voice generation." },
          { status: 400 }
        );
      }

      console.log("Generating voice:", command.prompt);

      const audio = await generateVoice(command.prompt);

      console.log("Voice generated successfully");

      return Response.json({
        type: "voice",
        prompt: command.prompt,
        audio,
      });
    }

    // NORMAL CHAT
    const result = await generateText({
      model: openrouter("openrouter/free"),
      prompt: command.prompt,
    });

    return Response.json({
      type: "chat",
      reply: result.text,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI request failed",
      },
      { status: 500 }
    );
  }
}
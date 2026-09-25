export type CommandType = "image" | "voice" | "chat";

export function parseCommand(message: string): {
  type: CommandType;
  prompt: string;
} {
  const text = message.trim();

  if (text.startsWith("/image")) {
    return {
      type: "image",
      prompt: text.slice("/image".length).trim(),
    };
  }

 
  if (text.startsWith("/voice")) {
    return {
      type: "voice",
      prompt: text.slice("/voice".length).trim(),
    };
  }

  if (text.startsWith("/chat")) {
    return {
      type: "chat",
      prompt: text.slice("/chat".length).trim(),
    };
  }

  return {
    type: "chat",
    prompt: text,
  };
}
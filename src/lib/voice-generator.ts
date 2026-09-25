import { hf } from "@/lib/huggingface";

export async function generateVoice(text: string) {
  const cleanText = text.trim();

  if (!cleanText) {
    throw new Error("Voice text cannot be empty.");
  }

  if (cleanText.length > 2000) {
    throw new Error(
      "Voice text is too long. Keep it under 2000 characters."
    );
  }

  const audio = await hf.textToSpeech({
    model: "hexgrad/Kokoro-82M",
    inputs: cleanText,
    provider: "deepinfra",
  });

  if (!audio) {
    throw new Error("Voice generation returned no audio.");
  }

  const buffer = Buffer.from(await audio.arrayBuffer());

  if (!buffer.length) {
    throw new Error("Generated audio is empty.");
  }

  return `data:audio/wav;base64,${buffer.toString("base64")}`;
}
import { hf } from "@/lib/huggingface";

export async function generateImage(prompt: string): Promise<string> {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    throw new Error("Image prompt cannot be empty.");
  }

  const image = await hf.textToImage({
    model: "black-forest-labs/FLUX.1-dev",
    inputs: cleanPrompt,
    provider: "auto",
    parameters: {
      width: 1024,
      height: 1024,
    },
    outputType: "dataUrl",
  });

  return image;
}
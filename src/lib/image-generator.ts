import { puter } from "@heyputer/puter.js";

export async function generateImage(
  prompt: string
): Promise<string> {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    throw new Error("Image prompt cannot be empty.");
  }

  try {
    console.log(
      "Generating image:",
      cleanPrompt
    );

    const image = await puter.ai.txt2img(
      cleanPrompt,
      {
        model: "black-forest-labs/flux-schnell",
      }
    );

    if (!image?.src) {
      throw new Error(
        "Puter returned an invalid image response."
      );
    }

    console.log(
      "Image generated successfully."
    );

    return image.src;
  } catch (error: unknown) {
    console.error(
      "Puter image generation failed:",
      error
    );

    if (error instanceof Error) {
      throw new Error(
        `Image generation failed: ${error.message}`
      );
    }

    throw new Error(
      "Image generation failed."
    );
  }
}
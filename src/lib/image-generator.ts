import { init } from "@heyputer/puter.js/src/init.cjs";

const authToken = process.env.PUTER_AUTH_TOKEN;

if (!authToken) {
  throw new Error(
    "PUTER_AUTH_TOKEN is missing from .env.local"
  );
}

const puter = init(authToken);

export async function generateImage(
  prompt: string
): Promise<string> {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    throw new Error("Image prompt cannot be empty.");
  }

  try {
    console.log("Generating image:", cleanPrompt);

    const image = await puter.ai.txt2img(cleanPrompt, {
      model: "black-forest-labs/flux-schnell",
    });

    if (!image) {
      throw new Error("Puter returned an empty response.");
    }

    if (
      typeof image === "object" &&
      image !== null &&
      "src" in image
    ) {
      const src = (image as { src?: unknown }).src;

      if (typeof src === "string" && src.length > 0) {
        console.log("Image generated successfully.");
        return src;
      }
    }

    console.error("Unexpected Puter response:", image);

    throw new Error(
      "Puter returned an invalid image response."
    );
  } catch (error: unknown) {
    console.error("Puter image generation failed:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      throw new Error(
        `Image generation failed: ${String(
          (error as { message: unknown }).message
        )}`
      );
    }

    throw new Error("Image generation failed.");
  }
}
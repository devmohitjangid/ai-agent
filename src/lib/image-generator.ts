export async function generateImage(
  prompt: string
): Promise<string> {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    throw new Error("Image prompt cannot be empty.");
  }

  try {
    const response = await fetch("/api/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: cleanPrompt }),
    });

    const data = (await response.json()) as {
      image?: string;
      error?: string;
    };

    if (!response.ok || !data.image) {
      throw new Error(
        data.error || `Image request failed (${response.status}).`
      );
    }

    return data.image;
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

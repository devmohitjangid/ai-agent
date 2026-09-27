function getAuthToken() {
  const token = process.env.PUTER_AUTH_TOKEN?.trim();
  if (!token) {
    throw new Error("PUTER_AUTH_TOKEN is not configured on the server.");
  }
  return token;
}

async function readImageUrl(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("json")) {
    const payload = (await response.json()) as {
      result?: unknown;
      error?: { message?: string } | string;
    };
    const result = payload.result;

    if (typeof result === "string") return result;
    if (result && typeof result === "object") {
      const value = result as { url?: unknown; asset_url?: unknown };
      if (typeof value.url === "string") return value.url;
      if (typeof value.asset_url === "string") return value.asset_url;
    }

    const error = payload.error;
    throw new Error(
      typeof error === "string"
        ? error
        : error?.message || "Puter returned an invalid image response."
    );
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  return `data:${contentType || "image/png"};base64,${bytes.toString("base64")}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { prompt?: unknown };
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return Response.json(
        { error: "Image prompt is required." },
        { status: 400 }
      );
    }

    const token = getAuthToken();
    const response = await fetch("https://api.puter.com/drivers/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain;actually=json",
      },
      body: JSON.stringify({
        interface: "puter-image-generation",
        driver: "ai-image",
        method: "generate",
        test_mode: false,
        args: {
          prompt,
          model: "black-forest-labs/flux-schnell",
        },
        auth_token: token,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Puter request failed (${response.status}).`);
    }

    return Response.json({ image: await readImageUrl(response) });
  } catch (error: unknown) {
    console.error("Puter image API error:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Image generation failed.",
      },
      { status: 500 }
    );
  }
}

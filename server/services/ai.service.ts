export class AiService {
  private static OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
  private static MODEL = "openai/gpt-image-2";

  static async runTryOn(input: {
    modelImage: string;
    garmentImage: string;
    category: string;
  }): Promise<{ resultImage: string }> {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("AI_CONFIG_ERROR: Missing OPENROUTER_API_KEY");
    }

    const categoryLabel: Record<string, string> = {
      tops: "top (shirt, blouse, jacket, or upper garment)",
      bottoms: "bottom (pants, skirt, or lower garment)",
      "one-pieces": "full outfit (dress or jumpsuit)",
    };
    const label = categoryLabel[input.category] ?? "garment";

    const prompt =
      `You are a virtual try-on assistant. Produce a single photorealistic image showing the person ` +
      `from the first photo wearing the exact ${label} from the second photo. ` +
      `Rules: (1) Preserve the person's face, body shape, skin tone, pose, and proportions exactly. ` +
      `(2) Reproduce the garment's exact design, color, pattern, texture, logos, buttons, and stitching. ` +
      `(3) Show natural fabric draping and fit on the person's body. ` +
      `(4) Keep the same background and lighting as the person's original photo. ` +
      `Output only the final try-on image — no comparisons, no side-by-side, no text overlays.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000);

    try {
      const response = await fetch(this.OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://mirror-tryon.replit.app",
          "X-Title": "MIRROR Virtual Try-On",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.MODEL,
          modalities: ["image"],
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: { url: input.modelImage, detail: "high" },
                },
                {
                  type: "image_url",
                  image_url: { url: input.garmentImage, detail: "high" },
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg =
          errorData?.error?.message ||
          `AI_API_ERROR: ${response.status} ${response.statusText}`;
        throw new Error(msg);
      }

      const data = await response.json();
      const message = data?.choices?.[0]?.message;

      if (!message) {
        throw new Error("AI_API_ERROR: No response from GPT Image 2");
      }

      // OpenRouter returns images in message.images[]
      if (message.images?.[0]?.image_url?.url) {
        return { resultImage: message.images[0].image_url.url };
      }

      // Fallback: image embedded in content array
      if (Array.isArray(message.content)) {
        const imgContent = message.content.find(
          (c: any) => c.type === "image_url"
        );
        if (imgContent?.image_url?.url) {
          return { resultImage: imgContent.image_url.url };
        }
      }

      throw new Error(
        "AI_API_ERROR: GPT Image 2 returned no image. Check your OpenRouter credits at openrouter.ai/settings/credits"
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

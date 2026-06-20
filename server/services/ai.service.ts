import { TryOnStatus } from "@shared/schema";

export class AiService {
  private static OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
  private static MODEL = "black-forest-labs/flux.2-pro";

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
      `Create a photorealistic virtual try-on image. Show the exact person from the first image ` +
      `wearing the exact ${label} shown in the second image. ` +
      `Preserve the person's face, body shape, skin tone, and proportions precisely. ` +
      `Reproduce the garment's exact design, colors, pattern, texture, logos, and details exactly as shown. ` +
      `The final image should look like a professional fashion photo with natural lighting.`;

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
                { type: "image_url", image_url: { url: input.modelImage } },
                { type: "image_url", image_url: { url: input.garmentImage } },
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
        throw new Error("AI_API_ERROR: No response message from model");
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
        "AI_API_ERROR: Model returned no image. Ensure your OpenRouter account has image-generation credits."
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

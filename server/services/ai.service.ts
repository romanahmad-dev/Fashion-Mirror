export class AiService {
  private static FAL_URL = "https://fal.run/fal-ai/fashn/tryon/v1.6";

  static async runTryOn(input: {
    modelImage: string;
    garmentImage: string;
    category: string;
  }): Promise<{ resultImage: string }> {
    if (!process.env.FAL_KEY) {
      throw new Error("AI_CONFIG_ERROR: Missing FAL_KEY");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000);

    try {
      const response = await fetch(this.FAL_URL, {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.FAL_KEY}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model_image: input.modelImage,
          garment_image: input.garmentImage,
          category: input.category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg =
          errorData?.detail ||
          errorData?.error?.message ||
          `AI_API_ERROR: ${response.status} ${response.statusText}`;
        throw new Error(msg);
      }

      const data = await response.json();

      // fal.ai FASHN returns { images: [{ url: "..." }] }
      const imageUrl = data?.images?.[0]?.url ?? data?.image?.url ?? data?.output?.[0];

      if (!imageUrl) {
        throw new Error(
          "AI_API_ERROR: fal.ai returned no image. Check your FAL_KEY and account credits at fal.ai/dashboard."
        );
      }

      return { resultImage: imageUrl };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

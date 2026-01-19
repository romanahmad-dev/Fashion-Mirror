import { FashnResponse, TryOnStatus } from "@shared/schema";

export class AiService {
  private static API_URL = "https://api.fashn.ai/v1";

  static async runTryOn(input: {
    modelImage: string;
    garmentImage: string;
    category: string;
  }): Promise<{ id: string }> {
    if (!process.env.FASHN_API_KEY) {
      throw new Error("AI_CONFIG_ERROR: Missing FASHN_API_KEY");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch(`${this.API_URL}/run`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.FASHN_API_KEY}`,
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          model_name: "fashn-tryon-v1",
          inputs: {
            model_image: input.modelImage,
            garment_image: input.garmentImage,
            category: input.category
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `AI_API_ERROR: ${response.statusText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static async checkStatus(predictionId: string): Promise<FashnResponse> {
    const response = await fetch(`${this.API_URL}/status/${predictionId}`, {
      headers: {
        "Authorization": `Bearer ${process.env.FASHN_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error("AI_STATUS_FETCH_FAILED");
    }

    return await response.json();
  }
}

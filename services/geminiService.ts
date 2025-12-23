import { GoogleGenAI, Type } from "@google/genai";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a receipt image to extract data.
 */
export const analyzeReceipt = async (
  base64Image: string,
  availableTypes: string[]
): Promise<{
  date?: string;
  creditor?: string;
  amount?: number;
  observations?: string;
  suggestedType?: string;
}> => {
  try {
    const prompt = `
      Analyze this receipt image. Extract the following information in JSON format:
      - date: The date of the transaction (format YYYY-MM-DD).
      - creditor: The name of the merchant or business.
      - amount: The total amount paid (number).
      - observations: A brief summary of items purchased.
      - suggestedType: Based on the content, suggest one of these categories: ${availableTypes.join(
        ", "
      )}. If unsure, use "Otros gastos".
    `;

    // Remove data:image/png;base64, prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Good for fast text/data extraction
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            creditor: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            observations: { type: Type.STRING },
            suggestedType: { type: Type.STRING },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text from Gemini");
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    throw error;
  }
};

/**
 * Edits a receipt image based on user prompt using Gemini 2.5 Flash Image.
 */
export const editReceiptImage = async (
  base64Image: string,
  userPrompt: string
): Promise<string> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // Using gemini-2.5-flash-image (Nano Banana) for image editing
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: `Edit this image: ${userPrompt}. Return only the image.`,
          },
        ],
      },
      // Note: No responseMimeType for image generation/editing in this context usually,
      // but we need to check the parts for the image.
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error editing receipt:", error);
    throw error;
  }
};

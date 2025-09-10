
import { GoogleGenAI, Modality } from "@google/genai";

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the `data:image/...;base64,` prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });

export const generateCmfDesign = async (imageFiles: File[], material: string, color: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const base64ImagePromises = imageFiles.map(fileToBase64);
  const base64ImagesData = await Promise.all(base64ImagePromises);

  const imageParts = imageFiles.map((file, index) => ({
    inlineData: {
      data: base64ImagesData[index],
      mimeType: file.type,
    },
  }));

  const prompt = `Please redesign the product(s) shown in the image(s). If multiple images are provided, treat them as different views of the same product or a cohesive product line.
Apply a '${material}' material and finish.
Change its primary color to the hex code '${color}'.
Maintain the original product shape, proportions, and background as much as possible. The final output must be only the redesigned product image, with no additional text or commentary.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        ...imageParts,
        {
          text: prompt,
        },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("The AI did not return a valid image. Please try again with a different image or prompt.");
};

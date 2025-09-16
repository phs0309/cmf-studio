
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

export interface AIRecommendationInput {
  productName: string;
  productIntent: string;
  preferredColors: string;
}

export interface AIRecommendationResult {
  material: string;
  color: string;
  finish: string;
  description: string;
  reasoning: string;
}

export const generateAIRecommendation = async (input: AIRecommendationInput): Promise<AIRecommendationResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `당신은 제품 디자인 전문가이자 최신 트렌드 분석가입니다. 
다음 제품에 대해 2024-2025년 최신 디자인 트렌드를 반영한 CMF(Color, Material, Finish) 디자인을 추천해주세요.

제품 정보:
- 제품명: ${input.productName}
- 용도 및 의도: ${input.productIntent}
${input.preferredColors ? `- 선호 색상: ${input.preferredColors}` : ''}

다음 형식으로 정확히 응답해주세요 (JSON 형식):
{
  "material": "추천 소재명",
  "color": "#RRGGBB 형식의 색상 코드",
  "finish": "추천 마감 방식",
  "description": "추천 이유 및 디자인 설명 (50자 이내)",
  "reasoning": "최신 트렌드 분석 및 상세 설명 (100자 이내)"
}

최신 트렌드를 고려하여 실용적이고 현실적인 추천을 해주세요.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error("AI 응답을 받을 수 없습니다.");
    }

    // JSON 응답 파싱
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("JSON 형식의 응답을 찾을 수 없습니다.");
      }
      
      const recommendation = JSON.parse(jsonMatch[0]);
      
      // 필수 필드 검증
      if (!recommendation.material || !recommendation.color || !recommendation.finish || 
          !recommendation.description || !recommendation.reasoning) {
        throw new Error("응답에 필수 필드가 누락되었습니다.");
      }

      return recommendation;
    } catch (parseError) {
      // JSON 파싱 실패 시 기본값 반환
      console.warn("AI 응답 파싱 실패, 기본 추천을 제공합니다:", parseError);
      return getDefaultRecommendation(input);
    }
  } catch (error) {
    console.error("AI 추천 생성 실패:", error);
    return getDefaultRecommendation(input);
  }
};

// 기본 추천 제공 함수
function getDefaultRecommendation(input: AIRecommendationInput): AIRecommendationResult {
  const recommendations = [
    {
      material: "브러시드 알루미늄",
      color: "#4A90E2",
      finish: "무광",
      description: "모던하고 세련된 디자인으로 전문적인 느낌을 연출합니다.",
      reasoning: "2024년 트렌드인 미니멀 디자인과 프리미엄 소재 조합으로 인기가 높습니다."
    },
    {
      material: "무광 플라스틱",
      color: "#2ECC71",
      finish: "소프트 터치",
      description: "친환경적이면서도 내구성이 뛰어난 소재입니다.",
      reasoning: "환경 친화적인 소재 사용이 최신 트렌드이며 지속가능한 디자인을 추구합니다."
    },
    {
      material: "양극처리 티타늄",
      color: "#E67E22",
      finish: "아노다이징",
      description: "따뜻하고 자연스러운 감성을 표현합니다.",
      reasoning: "자연 소재와 따뜻한 색감이 2024년 주요 트렌드로 주목받고 있습니다."
    }
  ];

  // 입력에 따라 적절한 추천 선택
  let selectedIndex = 0;
  
  if (input.productIntent.includes('전문') || input.productIntent.includes('업무')) {
    selectedIndex = 0; // 알루미늄
  } else if (input.productIntent.includes('환경') || input.productIntent.includes('친환경')) {
    selectedIndex = 1; // 스테인리스 스틸
  } else if (input.productIntent.includes('가정') || input.productIntent.includes('따뜻')) {
    selectedIndex = 2; // 세라믹
  } else {
    selectedIndex = Math.floor(Math.random() * recommendations.length);
  }

  return recommendations[selectedIndex];
}

export const generateCmfDesign = async (imageFiles: File[], material: string, color: string, description?: string): Promise<string> => {
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

  const basePrompt = `Please redesign the product(s) shown in the image(s). If multiple images are provided, treat them as different views of the same product or a cohesive product line.
Apply a '${material}' material and finish.
Change its primary color to the hex code '${color}'.
Maintain the original product shape, proportions, and background as much as possible.`;

  const additionalDescription = description && description.trim() ? `\nAdditional requirements: ${description}` : '';
  
  const prompt = `${basePrompt}${additionalDescription}\nThe final output must be only the redesigned product image, with no additional text or commentary.`;

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

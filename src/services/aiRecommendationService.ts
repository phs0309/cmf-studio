import { GoogleGenAI } from '@google/genai';
import { MATERIALS, FINISHES } from '../../constants';

const API_KEY = (process.env.API_KEY as string) || import.meta.env.VITE_API_KEY;

// Debug logging
console.log('API_KEY check:', {
  processEnvKey: process.env.API_KEY ? 'exists' : 'missing',
  viteEnvKey: import.meta.env.VITE_API_KEY ? 'exists' : 'missing',
  finalKey: API_KEY ? 'exists' : 'missing'
});

interface AIRecommendationResult {
  material: string;
  color: string;
  finish: string;
  reasoning: string;
}

export const getAIRecommendation = async (
  productName: string,
  productPurpose: string,
  imageFiles?: File[]
): Promise<AIRecommendationResult> => {
  console.log('🔑 API Key Debug:', {
    processEnvKey: process.env.API_KEY,
    viteEnvKey: import.meta.env.VITE_API_KEY,
    finalApiKey: API_KEY,
    apiKeyLength: API_KEY?.length || 0
  });
  
  if (!API_KEY) {
    console.error('❌ API Key is missing!');
    throw new Error('AI 추천 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
  
  if (API_KEY.includes('your_') || API_KEY === 'your_gemini_api_key_here') {
    console.error('❌ API Key is placeholder value:', API_KEY);
    throw new Error('AI 추천 서비스 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.');
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // 사용 가능한 소재와 마감 옵션 준비
  const availableMaterials = MATERIALS.map(m => m.name).join(', ');
  const availableFinishes = FINISHES.join(', ');

  // 프롬프트 구성
  const prompt = `당신은 2024-2025 최신 트렌드를 반영하는 CMF(Color, Material, Finish) 디자인 전문가입니다.

제품 정보:
- 제품명: ${productName}
- 타겟/목적: ${productPurpose}

사용 가능한 소재 옵션: ${availableMaterials}
사용 가능한 마감 옵션: ${availableFinishes}

다음 기준으로 최적의 CMF를 추천해주세요:

1. 2024-2025 디자인 트렌드 반영
2. 제품의 용도와 타겟 사용자에 최적화
3. 색상은 HEX 코드로 제공 (#RRGGBB 형식)
4. 실용성과 심미성의 균형

응답은 반드시 다음 JSON 형식으로만 제공해주세요:
{
  "material": "추천 소재명 (위 옵션 중 정확히 일치)",
  "color": "#RRGGBB",
  "finish": "추천 마감명 (위 옵션 중 정확히 일치)",
  "reasoning": "추천 이유 (2-3문장, 트렌드와 제품 특성 언급)"
}`;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const response = await model.generateContent(prompt);
    
    console.log('🔍 Full API Response:', response);
    
    let text;
    if (response.response && typeof response.response.text === 'function') {
      text = response.response.text();
    } else if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      text = response.candidates[0].content.parts[0].text;
    } else {
      console.error('❌ Unexpected response structure:', response);
      throw new Error('Unexpected API response structure');
    }
    
    console.log('📝 Generated text:', text);
    
    // JSON 부분만 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('유효한 JSON 응답을 받지 못했습니다.');
    }

    const recommendation = JSON.parse(jsonMatch[0]);

    // 응답 검증 및 기본값 설정
    if (!MATERIALS.some(m => m.name === recommendation.material)) {
      recommendation.material = MATERIALS[0].name;
    }
    if (!FINISHES.includes(recommendation.finish)) {
      recommendation.finish = FINISHES[0];
    }
    if (!recommendation.color.match(/^#[0-9A-Fa-f]{6}$/)) {
      recommendation.color = '#007aff';
    }
    if (!recommendation.reasoning) {
      recommendation.reasoning = '2024-2025 트렌드를 반영한 추천입니다.';
    }

    return recommendation;
  } catch (error) {
    console.error('AI 추천 생성 중 오류:', error);
    
    // API 키 관련 오류 처리
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('AI 추천 서비스 설정에 문제가 있습니다. 관리자에게 문의해주세요.');
    }
    
    // 기타 오류 처리
    if (error instanceof Error && error.message.includes('400')) {
      throw new Error('요청 처리 중 오류가 발생했습니다. 입력 정보를 확인하고 다시 시도해주세요.');
    }
    
    // 일반적인 오류
    throw new Error('AI 추천 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
};
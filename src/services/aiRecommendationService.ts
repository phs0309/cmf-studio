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
  const prompt = `당신은 세계적인 CMF(Color, Material, Finish) 디자인 전문가이며, 2024-2025 최신 글로벌 트렌드를 정확히 분석하고 적용하는 능력을 갖추고 있습니다.

제품 정보:
- 제품명: ${productName}
- 타겟/목적: ${productPurpose}

사용 가능한 소재 옵션: ${availableMaterials}
사용 가능한 마감 옵션: ${availableFinishes}

다음 세부 기준에 따라 최적의 CMF 디자인을 추천해주세요:

1. **2024-2025 글로벌 디자인 트렌드 분석**:
   - 지속가능성과 친환경 소재 선호도
   - 미니멀리즘과 기능성의 조화
   - 감성적 컬러 팔레트 활용
   - 촉각적 경험을 강조하는 마감 처리

2. **사용자 경험(UX) 최적화**:
   - 제품의 주요 사용 환경과 맥락 고려
   - 타겟 사용자의 라이프스타일과 가치관 반영
   - 감정적 연결고리 형성을 위한 디자인 언어

3. **기술적/실용적 고려사항**:
   - 내구성과 유지보수 용이성
   - 제조 공정의 효율성과 비용 효과
   - 장기간 사용 시의 색상 변화와 마모 저항성

4. **심리학적 색상 효과**:
   - 색상이 사용자에게 미치는 심리적 영향
   - 브랜드 이미지와 제품 포지셔닝에 미치는 효과

응답은 반드시 다음 JSON 형식으로만 제공해주세요:
{
  "material": "추천 소재명 (위 옵션 중 정확히 일치)",
  "color": "#RRGGBB",
  "finish": "추천 마감명 (위 옵션 중 정확히 일치)",
  "reasoning": "상세한 추천 이유 (5-7문장으로 구성): 1) 선택한 소재의 특성과 장점, 2) 색상 선택의 심리학적/트렌드적 근거, 3) 마감 처리가 사용자 경험에 미치는 영향, 4) 2024-2025 트렌드와의 연관성, 5) 제품 특성과의 시너지 효과를 포함하여 전문적이고 구체적으로 설명"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('AI 응답을 받을 수 없습니다.');
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
import React, { useState } from 'react';
import { generateAIRecommendation as getAIRecommendation } from '../services/geminiService';

interface AIRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecommendation: (recommendation: AIRecommendation) => void;
}

export interface AIRecommendation {
  material: string;
  color: string;
  finish: string;
  description: string;
  reasoning: string;
}

export const AIRecommendationModal: React.FC<AIRecommendationModalProps> = ({
  isOpen,
  onClose,
  onRecommendation,
}) => {
  const [productName, setProductName] = useState('');
  const [productIntent, setProductIntent] = useState('');
  const [preferredColors, setPreferredColors] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName.trim() || !productIntent.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      // AI 추천 생성
      const recommendation = await getAIRecommendation({
        productName: productName.trim(),
        productIntent: productIntent.trim(),
        preferredColors: preferredColors.trim(),
      });

      onRecommendation(recommendation);
      onClose();
      
      // 폼 초기화
      setProductName('');
      setProductIntent('');
      setPreferredColors('');
    } catch (error) {
      console.error('AI 추천 생성 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">AI 디자인 추천</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 설명 */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-800">
              <span className="font-semibold">AI가 최신 트렌드를 분석하여</span> 제품에 가장 적합한 색상, 소재, 마감을 추천해드립니다.
            </p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                제품명 *
              </label>
              <input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="예: iPhone 케이스, 노트북, 의자 등"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="productIntent" className="block text-sm font-medium text-gray-700 mb-2">
                제품의 용도 및 의도 *
              </label>
              <textarea
                id="productIntent"
                value={productIntent}
                onChange={(e) => setProductIntent(e.target.value)}
                placeholder="예: 젊은 직장인을 위한 세련된 업무용 액세서리, 가정용 친환경 가구 등"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
                required
              />
            </div>

            <div>
              <label htmlFor="preferredColors" className="block text-sm font-medium text-gray-700 mb-2">
                선호하는 색상 (선택사항)
              </label>
              <input
                id="preferredColors"
                type="text"
                value={preferredColors}
                onChange={(e) => setPreferredColors(e.target.value)}
                placeholder="예: 파스텔톤, 모노톤, 따뜻한 색상 등"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* 버튼들 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading || !productName.trim() || !productIntent.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI 추천받기
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
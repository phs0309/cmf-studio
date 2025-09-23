import React, { useState } from 'react';

interface TutorialStep {
  id: number;
  title: string;
  content: string;
  target?: string;
}

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: "1단계: 이미지 업로드",
    content: "제품 이미지를 업로드하세요. 최대 3개까지 가능하며, 다양한 각도의 사진을 올리면 더 좋은 결과를 얻을 수 있습니다.",
  },
  {
    id: 2,
    title: "2단계: 제품 정보 입력",
    content: "제품명과 타겟/목적을 입력하세요. AI가 이 정보를 바탕으로 더 정확한 추천을 제공합니다.",
  },
  {
    id: 3,
    title: "3단계: AI 추천 받기",
    content: "AI 스마트 추천 버튼을 클릭하여 최신 트렌드를 반영한 맞춤형 CMF 추천을 받아보세요.",
  },
  {
    id: 4,
    title: "4단계: 소재 & 색상 선택",
    content: "다양한 소재 중 선택하고, 색상 피커를 사용해 원하는 색상을 지정하세요. 여러 개의 세트를 만들 수도 있습니다.",
  },
  {
    id: 5,
    title: "5단계: 디자인 생성",
    content: "'디자인 생성하기' 버튼을 클릭하면 AI가 새로운 CMF 디자인을 생성합니다. 2-5분 정도 소요됩니다.",
  },
];

export const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose, onStart }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepByStep, setIsStepByStep] = useState(false);

  if (!isOpen) return null;

  const handleStartStepByStep = () => {
    setIsStepByStep(true);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    onClose();
    onStart();
  };

  const handleSkip = () => {
    onClose();
    onStart();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {!isStepByStep ? (
          // Overview mode
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🎯 CMF Studio 튜토리얼</h2>
              <p className="text-lg text-gray-600">AI 기반 CMF 디자인 도구 사용법을 알아보세요</p>
            </div>

            <div className="space-y-4 mb-8">
              {TUTORIAL_STEPS.map((step) => (
                <div key={step.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.id}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleStartStepByStep}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-200 shadow-lg"
              >
                📚 단계별 가이드 시작
              </button>
              <button
                onClick={handleSkip}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                바로 시작하기
              </button>
            </div>
          </div>
        ) : (
          // Step-by-step mode
          <div className="p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">튜토리얼</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                ></div>
              </div>
              
              <div className="text-sm text-gray-500 text-center">
                {currentStep + 1} / {TUTORIAL_STEPS.length}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {TUTORIAL_STEPS[currentStep].title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {TUTORIAL_STEPS[currentStep].content}
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                이전
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  건너뛰기
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-200"
                >
                  {currentStep === TUTORIAL_STEPS.length - 1 ? '시작하기' : '다음'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
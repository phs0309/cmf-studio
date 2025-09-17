import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Controls } from './components/Controls';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { AIRecommendationModal, AIRecommendation } from './components/AIRecommendationModal';
import { generateCmfDesign } from './services/geminiService';
import { MATERIALS, MATERIAL_NAMES, FINISHES, MaterialColorSet } from './constants';
import { ChevronLeftIcon } from './components/icons/ChevronLeftIcon';

const App: React.FC = () => {
  const [designerStep, setDesignerStep] = useState<1 | 2>(1);
  const [freeUsageCount, setFreeUsageCount] = useState<number>(0);


  // Designer states
  const [originalImages, setOriginalImages] = useState<Array<{ file: File | null; previewUrl: string | null }>>(
    Array.from({ length: 3 }, () => ({ file: null, previewUrl: null }))
  );
  // Material-Color sets (max 3)
  const [materialColorSets, setMaterialColorSets] = useState<MaterialColorSet[]>([
    { id: '1', material: MATERIALS[0].name, color: '#007aff', enabled: true }
  ]);
  const [finish, setFinish] = useState<string>(FINISHES[0]);
  const [description, setDescription] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toggle states for each customization category
  const [finishEnabled, setFinishEnabled] = useState<boolean>(false);
  const [descriptionEnabled, setDescriptionEnabled] = useState<boolean>(false);
  
  // AI Recommendation modal state
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [showRecommendationBanner, setShowRecommendationBanner] = useState<boolean>(false);

  // Initialize free usage count from localStorage with 10-minute reset
  useEffect(() => {
    const checkAndResetCount = () => {
      const savedCount = localStorage.getItem('cmf-free-usage-count');
      const savedTimestamp = localStorage.getItem('cmf-usage-timestamp');
      const now = Date.now();
      const tenMinutesInMs = 10 * 60 * 1000; // 10 minutes
      
      if (savedTimestamp) {
        const lastUsage = parseInt(savedTimestamp, 10);
        // Reset count if 10 minutes have passed
        if (now - lastUsage > tenMinutesInMs) {
          setFreeUsageCount(0);
          localStorage.setItem('cmf-free-usage-count', '0');
          localStorage.setItem('cmf-usage-timestamp', now.toString());
        } else if (savedCount) {
          setFreeUsageCount(parseInt(savedCount, 10));
        }
      } else {
        // First time user - initialize timestamp
        localStorage.setItem('cmf-usage-timestamp', now.toString());
      }
    };

    // Initial check
    checkAndResetCount();

    // Set up timer to check every minute
    const interval = setInterval(checkAndResetCount, 60 * 1000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);


  const handleImagesUpload = (files: File[]) => {
    const newImages = [...originalImages];
    let addedCount = 0;
    
    files.forEach((file) => {
      // Find first empty slot
      const emptyIndex = newImages.findIndex(img => img.file === null);
      if (emptyIndex !== -1 && addedCount < 3) {
        const previewUrl = URL.createObjectURL(file);
        newImages[emptyIndex] = { file, previewUrl };
        addedCount++;
      }
    });
    
    setOriginalImages(newImages);
    setGeneratedImages([]);
    setError(null);
  };

  const handleExampleImageSelect = async (imagePath: string) => {
    try {
      // 예시 이미지를 fetch하여 File 객체로 변환
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const fileName = imagePath.split('/').pop() || 'example.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      
      // 빈 슬롯에 이미지 추가
      handleImagesUpload([file]);
    } catch (error) {
      console.error('Error loading example image:', error);
      setError('예시 이미지를 불러오는데 실패했습니다.');
    }
  };

  const handleImageRemove = (index: number) => {
    const newImages = [...originalImages];
    if (newImages[index].previewUrl) {
      URL.revokeObjectURL(newImages[index].previewUrl!);
    }
    newImages[index] = { file: null, previewUrl: null };
    setOriginalImages(newImages);
    setGeneratedImages([]);
    setError(null);
  };

  // Material-Color set management
  const addMaterialColorSet = () => {
    if (materialColorSets.length < 3) {
      const newSet: MaterialColorSet = {
        id: Date.now().toString(),
        material: MATERIALS[0].name,
        color: '#007aff',
        enabled: true
      };
      setMaterialColorSets([...materialColorSets, newSet]);
    }
  };

  const removeMaterialColorSet = (id: string) => {
    if (materialColorSets.length > 1) {
      setMaterialColorSets(materialColorSets.filter(set => set.id !== id));
    }
  };

  const updateMaterialColorSet = (id: string, updates: Partial<MaterialColorSet>) => {
    setMaterialColorSets(materialColorSets.map(set => 
      set.id === id ? { ...set, ...updates } : set
    ));
  };
  
  useEffect(() => {
    return () => {
      originalImages.forEach(image => {
        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
    };
  }, [originalImages]);


  const handleGenerate = useCallback(async () => {
    const uploadedFiles = originalImages.map(img => img.file).filter((file): file is File => file !== null);

    if (uploadedFiles.length === 0) {
      setError('Please upload at least one product image.');
      return;
    }

    // Check free usage limit
    if (freeUsageCount >= 4) {
      setError('무료 체험 횟수(4회)를 모두 사용하셨습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      // Get enabled material-color sets
      const enabledSets = materialColorSets.filter(set => set.enabled);
      const materials = enabledSets.map(set => set.material);
      const colors = enabledSets.map(set => set.color);
      
      const newImagesBase64 = await generateCmfDesign(uploadedFiles, materials, colors, description);
      setGeneratedImages(newImagesBase64);
      
      // Increment free usage count and update timestamp
      const newCount = freeUsageCount + 1;
      const now = Date.now();
      setFreeUsageCount(newCount);
      localStorage.setItem('cmf-free-usage-count', newCount.toString());
      localStorage.setItem('cmf-usage-timestamp', now.toString());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImages, materialColorSets, description, freeUsageCount]);
  
  const handleRedo = () => {
    setOriginalImages(Array.from({ length: 3 }, () => ({ file: null, previewUrl: null })));
    setGeneratedImages([]);
    setError(null);
    setMaterialColorSets([{ id: '1', material: MATERIALS[0].name, color: '#007aff', enabled: true }]);
    setFinish(FINISHES[0]);
    setDescription('');
    setFinishEnabled(false);
    setDescriptionEnabled(false);
    setAiRecommendation(null);
    setShowRecommendationBanner(false);
    setDesignerStep(1);
  };

  // AI 추천 처리
  const handleAIRecommendation = (recommendation: AIRecommendation) => {
    setAiRecommendation(recommendation);
    setShowRecommendationBanner(true);
    
    // AI 추천에 따라 첫 번째 세트 업데이트
    if (recommendation.material && MATERIAL_NAMES.includes(recommendation.material)) {
      updateMaterialColorSet(materialColorSets[0].id, { 
        material: recommendation.material, 
        enabled: true 
      });
    }
    if (recommendation.color) {
      updateMaterialColorSet(materialColorSets[0].id, { 
        color: recommendation.color, 
        enabled: true 
      });
    }
    if (recommendation.finish && FINISHES.includes(recommendation.finish)) {
      setFinish(recommendation.finish);
      setFinishEnabled(true);
    }
    if (recommendation.description) {
      setDescription(recommendation.description);
      setDescriptionEnabled(true);
    }
  };

  // AI 추천 적용
  const applyAIRecommendation = () => {
    if (aiRecommendation) {
      if (aiRecommendation.material && MATERIAL_NAMES.includes(aiRecommendation.material)) {
        updateMaterialColorSet(materialColorSets[0].id, { 
          material: aiRecommendation.material, 
          enabled: true 
        });
      }
      if (aiRecommendation.color) {
        updateMaterialColorSet(materialColorSets[0].id, { 
          color: aiRecommendation.color, 
          enabled: true 
        });
      }
      if (aiRecommendation.finish && FINISHES.includes(aiRecommendation.finish)) {
        setFinish(aiRecommendation.finish);
        setFinishEnabled(true);
      }
      if (aiRecommendation.description) {
        setDescription(aiRecommendation.description);
        setDescriptionEnabled(true);
      }
      setShowRecommendationBanner(false);
    }
  };

  // AI 추천 무시
  const dismissAIRecommendation = () => {
    setShowRecommendationBanner(false);
  };


  const isReadyToGenerate = originalImages.some(img => img.file !== null);
  const originalImageUrls = originalImages.map(img => img.previewUrl).filter((url): url is string => url !== null);
  const showResults = (generatedImages.length > 0 || (designerStep === 2 && isReadyToGenerate)) && !isLoading;
  
  const goToNextStep = () => setDesignerStep(2);
  const goToPrevStep = () => setDesignerStep(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white from-10% via-pink-300 via-60% to-purple-400 to-90% text-gray-800 font-sans relative overflow-hidden">
      {/* Dot pattern background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }}
      ></div>
      <Header />
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        {designerStep === 1 && (
          <div className="max-w-4xl mx-auto text-center space-y-12">
            {/* Hero Section */}
            <div className="space-y-6">
              <h1 className="text-6xl font-bold text-slate-900 leading-tight">
                CMF Vision
              </h1>
              <h2 className="text-3xl font-semibold text-slate-800">
                으로 스마트하고 빠르게<br />
                아이디어를 완성하세요
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                AI 기술을 활용해 제품의 색상, 소재, 마감을 즉시 시각화하고<br />
                완벽한 디자인 솔루션을 찾아보세요
              </p>
            </div>

            {/* CTA Section */}
            <div className="pt-8">
              <button
                onClick={goToNextStep}
                className="inline-flex items-center justify-center gap-3 text-white text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 focus:ring-4 focus:ring-purple-200 rounded-2xl px-12 py-4 transition-all duration-200 shadow-2xl hover:shadow-3xl hover:scale-105 transform"
              >
                Start
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
            
            {/* Usage Counter */}
            <div className="pt-6">
              <p className="text-sm text-slate-500">무료 체험</p>
              <p className="text-lg font-semibold text-pink-700">
                {freeUsageCount}/4회 사용
              </p>
              {freeUsageCount >= 4 && (
                <p className="text-xs text-red-500 mt-1">체험 횟수 소진</p>
              )}
            </div>
          </div>
        )}
        
        {designerStep === 2 && (
            <>
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Image Upload Section */}
                    <div className="space-y-6 bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-pink-300/70">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-semibold text-gray-900">1. 이미지 업로드</h2>
                            <button
                                onClick={goToPrevStep}
                                className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                                aria-label="홈으로 돌아가기"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                홈
                            </button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-base text-gray-600">최대 3개의 제품 이미지를 업로드할 수 있습니다 (예: 다른 각도).</p>
                            <ImageUploader
                                onImagesUpload={handleImagesUpload}
                                onExampleImageSelect={handleExampleImageSelect}
                                onImageRemove={handleImageRemove}
                                previewUrls={originalImages.map(img => img.previewUrl)}
                            />
                        </div>
                    </div>

                    {/* AI 추천 배너 */}
                    {showRecommendationBanner && aiRecommendation && (
                        <div className="space-y-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-6 rounded-2xl shadow-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-purple-900 mb-2">🎨 AI 디자인 추천</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-purple-800">추천 소재:</span>
                                            <span className="ml-2 text-purple-700">{aiRecommendation.material}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-purple-800">추천 색상:</span>
                                            <span className="ml-2 inline-flex items-center gap-2 text-purple-700">
                                                <span className="w-4 h-4 rounded border border-gray-300" style={{backgroundColor: aiRecommendation.color}}></span>
                                                {aiRecommendation.color}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-purple-800">추천 마감:</span>
                                            <span className="ml-2 text-purple-700">{aiRecommendation.finish}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-purple-800">설명:</span>
                                            <span className="ml-2 text-purple-700">{aiRecommendation.description}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-purple-600 mt-3 italic">{aiRecommendation.reasoning}</p>
                                </div>
                                <button
                                    onClick={dismissAIRecommendation}
                                    className="text-purple-400 hover:text-purple-600 ml-4"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={applyAIRecommendation}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    추천 적용하기
                                </button>
                                <button
                                    onClick={dismissAIRecommendation}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                >
                                    무시하기
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Controls Section */}
                    {isReadyToGenerate && (
                        <div className="space-y-6 bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-pink-300/70">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-gray-900">2. 사용자 정의 및 생성</h2>
                                <button
                                    onClick={() => setIsAIModalOpen(true)}
                                    className="flex items-center gap-2 text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 focus:ring-4 focus:ring-purple-200 font-medium rounded-lg text-sm px-4 py-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    AI에게 물어보기
                                </button>
                            </div>
                            <Controls
                                materialColorSets={materialColorSets}
                                onAddSet={addMaterialColorSet}
                                onRemoveSet={removeMaterialColorSet}
                                onUpdateSet={updateMaterialColorSet}
                                finish={finish}
                                setFinish={setFinish}
                                description={description}
                                setDescription={setDescription}
                                onGenerate={handleGenerate}
                                isLoading={isLoading}
                                isReady={isReadyToGenerate}
                                isLimitReached={freeUsageCount >= 4}
                                finishEnabled={finishEnabled}
                                setFinishEnabled={setFinishEnabled}
                                descriptionEnabled={descriptionEnabled}
                                setDescriptionEnabled={setDescriptionEnabled}
                            />
                        </div>
                    )}
                </div>

                {error && (
                <div className="max-w-5xl mx-auto mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                    <p>{error}</p>
                </div>
                )}

                {isLoading && (
                <div className="mt-16 flex flex-col items-center justify-center">
                    <Loader />
                    <p className="mt-4 text-lg text-gray-700">AI가 제품을 재디자인 중입니다...</p>
                    <p className="text-sm text-gray-500">잠시만 기다려주세요.</p>
                </div>
                )}
                
                {showResults && (
                <>
                    <ResultDisplay originalImageUrls={originalImageUrls} generatedImageUrls={generatedImages} />
                    {generatedImages.length > 0 && (
                        <div className="max-w-5xl mx-auto mt-8 flex justify-center gap-4">
                            <button
                                onClick={handleRedo}
                                className="text-gray-700 bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 focus:ring-4 focus:ring-purple-200 font-bold rounded-xl text-base px-6 py-3 text-center transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                            >
                                다시 하기
                            </button>
                        </div>
                    )}
                </>
                )}
            </>
        )}

        {/* AI 추천 모달 */}
        <AIRecommendationModal
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
            onRecommendation={handleAIRecommendation}
        />

      </main>
      <footer className="text-center py-6 text-slate-600 text-sm relative z-10">
        <p>Gemini API 제공</p>
      </footer>
    </div>
  );
};

export default App;
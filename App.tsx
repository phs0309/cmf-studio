import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Controls } from './components/Controls';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { AIRecommendationModal, AIRecommendation } from './components/AIRecommendationModal';
import { BlueprintToCMF } from './components/BlueprintToCMF';
import { generateCmfDesign } from './services/geminiService';
import { MATERIALS, MATERIAL_NAMES, FINISHES, MaterialColorSet } from './constants';
import { ChevronLeftIcon } from './components/icons/ChevronLeftIcon';
import { initKeepAlive } from './src/utils/keepAlive';

type Page = 'home' | 'cmf-editor' | 'blueprint-to-cmf';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [designerStep, setDesignerStep] = useState<1 | 2>(1);


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
  const [imageDescription, setImageDescription] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [designExplanation, setDesignExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toggle states for each customization category
  const [finishEnabled, setFinishEnabled] = useState<boolean>(false);
  const [descriptionEnabled, setDescriptionEnabled] = useState<boolean>(false);
  
  // AI Recommendation modal state
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [showRecommendationBanner, setShowRecommendationBanner] = useState<boolean>(false);


  // Initialize keep-alive service
  useEffect(() => {
    const cleanup = initKeepAlive();
    return cleanup;
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


    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      // Get enabled material-color sets
      const enabledSets = materialColorSets.filter(set => set.enabled);
      const materials = enabledSets.map(set => set.material);
      const colors = enabledSets.map(set => set.color);
      
      const result = await generateCmfDesign(uploadedFiles, materials, colors, description);
      setGeneratedImages(result.images);
      setDesignExplanation(result.explanation);
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImages, materialColorSets, description]);
  
  const handleRedo = () => {
    setOriginalImages(Array.from({ length: 3 }, () => ({ file: null, previewUrl: null })));
    setGeneratedImages([]);
    setDesignExplanation('');
    setError(null);
    setMaterialColorSets([{ id: '1', material: MATERIALS[0].name, color: '#007aff', enabled: true }]);
    setFinish(FINISHES[0]);
    setDescription('');
    setImageDescription('');
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

  // AI 소재 추천
  const handleAIRecommendMaterial = async (setId: string) => {
    const currentTrends = [
      "Sustainable Materials", "Eco-friendly", "Recycled Plastics", "Bio-based Materials",
      "Minimalist Design", "Natural Textures", "Premium Feel", "Anti-bacterial Surfaces"
    ];
    
    const trendContext = `Current 2024-2025 design trends: ${currentTrends.join(', ')}`;
    const productContext = imageDescription ? `Product: ${imageDescription}` : '';
    
    const recommendedMaterials = MATERIALS.filter(m => 
      m.name.includes('Glass') || m.name.includes('Metal') || m.name.includes('Premium')
    );
    
    const randomMaterial = recommendedMaterials[Math.floor(Math.random() * recommendedMaterials.length)];
    
    updateMaterialColorSet(setId, { 
      material: randomMaterial?.name || MATERIALS[0].name,
      enabled: true 
    });
    
    alert(`🎨 AI 추천: ${randomMaterial?.name}\n\n최신 트렌드를 반영한 고급스러운 소재입니다. ${trendContext}`);
  };

  // AI 색상 추천
  const handleAIRecommendColor = async (setId: string) => {
    const trendColors2025 = [
      '#FF6B35', // Coral
      '#2E8B57', // Sea Green
      '#4A90E2', // Sky Blue
      '#8E44AD', // Purple
      '#F39C12', // Orange
      '#E74C3C', // Red
      '#1ABC9C', // Turquoise
      '#34495E'  // Dark Gray
    ];
    
    const randomColor = trendColors2025[Math.floor(Math.random() * trendColors2025.length)];
    
    updateMaterialColorSet(setId, { 
      color: randomColor,
      enabled: true 
    });
    
    alert(`🎨 AI 추천 색상: ${randomColor}\n\n2024-2025 트렌드 컬러로 선택되었습니다. 현대적이고 세련된 느낌을 줍니다.`);
  };

  // AI 마감 추천
  const handleAIRecommendFinish = async () => {
    const trendFinishes = ['Matte', 'Satin', 'Premium Matte'];
    const randomFinish = trendFinishes[Math.floor(Math.random() * trendFinishes.length)];
    
    setFinish(randomFinish);
    setFinishEnabled(true);
    
    alert(`🎨 AI 추천 마감: ${randomFinish}\n\n최신 트렌드를 반영한 프리미엄 마감입니다. 지문이 덜 묻고 고급스러운 느낌을 제공합니다.`);
  };


  const isReadyToGenerate = originalImages.some(img => img.file !== null);
  const originalImageUrls = originalImages.map(img => img.previewUrl).filter((url): url is string => url !== null);
  console.log('Original images:', originalImages);
  console.log('Original image URLs:', originalImageUrls);
  const showResults = (generatedImages.length > 0 || (designerStep === 2 && isReadyToGenerate)) && !isLoading;
  
  const goToNextStep = () => setDesignerStep(2);
  const goToPrevStep = () => setDesignerStep(1);

  // Navigation handlers
  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    if (page === 'home') {
      setDesignerStep(1);
    } else if (page === 'cmf-editor') {
      setDesignerStep(2);
    }
  };

  const handleNavigateHome = () => {
    setCurrentPage('home');
    setDesignerStep(1);
  };

  return (
    <div className="min-h-screen text-gray-800 font-sans relative overflow-hidden" style={{
      backgroundImage: `url('/logos/back.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-white/10"></div>
      <Header onNavigate={handleNavigate} />
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        
        {/* Render different pages based on currentPage */}
        {currentPage === 'blueprint-to-cmf' && (
          <BlueprintToCMF onNavigateHome={handleNavigateHome} />
        )}
        
        {currentPage === 'home' && designerStep === 1 && (
          <div className="max-w-4xl mx-auto text-center space-y-12">
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="flex justify-center">
                <img src="/logos/logo2.png" alt="CMF Vision" className="h-12" />
              </div>
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
                onClick={() => handleNavigate('cmf-editor')}
                className="inline-flex items-center justify-center gap-3 text-white text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 focus:ring-4 focus:ring-purple-200 rounded-2xl px-12 py-4 transition-all duration-200 shadow-2xl hover:shadow-3xl hover:scale-105 transform"
              >
                Start
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
            
          </div>
        )}
        
        {(currentPage === 'cmf-editor' || (currentPage === 'home' && designerStep === 2)) && (
            <>
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Image Upload Section */}
                    <div className="space-y-6 bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-pink-300/70">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-semibold text-gray-900">1. 이미지 업로드</h2>
                            <button
                                onClick={handleNavigateHome}
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
                                imageDescription={imageDescription}
                                onImageDescriptionChange={setImageDescription}
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
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">2. 사용자 정의 및 생성</h2>
                                <p className="text-sm text-gray-600">소재, 색상, 마감을 설정하여 완벽한 CMF 디자인을 만들어보세요</p>
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
                                isLimitReached={false}
                                finishEnabled={finishEnabled}
                                setFinishEnabled={setFinishEnabled}
                                descriptionEnabled={descriptionEnabled}
                                setDescriptionEnabled={setDescriptionEnabled}
                                onAIRecommendMaterial={handleAIRecommendMaterial}
                                onAIRecommendColor={handleAIRecommendColor}
                                onAIRecommendFinish={handleAIRecommendFinish}
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
                    
                    {/* Design Explanation */}
                    {designExplanation && generatedImages.length > 0 && (
                        <div className="max-w-5xl mx-auto mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    🎨 AI 디자인 분석
                                </h3>
                                <div className="bg-white/80 rounded-xl p-6 shadow-sm">
                                    <p className="text-blue-800 leading-relaxed text-base whitespace-pre-line">
                                        {designExplanation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {generatedImages.length > 0 && (
                        <>
                            {/* Survey Section */}
                            <div className="max-w-5xl mx-auto mt-12 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8 text-center">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold text-purple-900">
                                        🎉 디자인이 완성되었습니다!
                                    </h3>
                                    <p className="text-lg text-purple-700">
                                        CMF Vision을 사용해보신 경험은 어떠셨나요?<br />
                                        여러분의 소중한 의견을 듣고 싶습니다.
                                    </p>
                                    <div className="pt-4">
                                        <a
                                            href="https://docs.google.com/forms/d/e/1FAIpQLSeAFxoaGyKiyAKqTjadEKsQFcNHqwCQvZW1Yr_BNRfrboS_8Q/viewform"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-3 text-white text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 focus:ring-4 focus:ring-purple-200 rounded-xl px-8 py-4 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            설문조사 참여하기
                                        </a>
                                    </div>
                                    <p className="text-sm text-purple-600">
                                        설문은 약 2-3분 소요되며, 서비스 개선에 큰 도움이 됩니다.
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="max-w-5xl mx-auto mt-8 flex justify-center gap-4">
                                <button
                                    onClick={handleRedo}
                                    className="text-gray-700 bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 focus:ring-4 focus:ring-purple-200 font-bold rounded-xl text-base px-6 py-3 text-center transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                                >
                                    다시 하기
                                </button>
                            </div>
                        </>
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
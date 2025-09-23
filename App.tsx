import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Controls } from './components/Controls';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { AIRecommendationModal, AIRecommendation } from './components/AIRecommendationModal';
import { BlueprintToCMF } from './components/BlueprintToCMF';
import { generateCmfDesign } from './services/geminiService';
import { getAIRecommendation } from './src/services/aiRecommendationService';
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
  const [productName, setProductName] = useState<string>('');
  const [productPurpose, setProductPurpose] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [designExplanation, setDesignExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAIRecommending, setIsAIRecommending] = useState<boolean>(false);
  
  // Toggle states for each customization category
  const [finishEnabled, setFinishEnabled] = useState<boolean>(false);
  const [descriptionEnabled, setDescriptionEnabled] = useState<boolean>(false);
  
  // AI Recommendation modal state
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [showRecommendationBanner, setShowRecommendationBanner] = useState<boolean>(false);
  const [isRecommendationApplied, setIsRecommendationApplied] = useState<boolean>(false);
  
  // Recent colors state
  const [recentColors, setRecentColors] = useState<string[]>([]);
  
  // Add color to recent colors
  const addToRecentColors = useCallback((color: string) => {
    setRecentColors(prev => {
      // Remove color if it already exists
      const filtered = prev.filter(c => c.toLowerCase() !== color.toLowerCase());
      // Add to beginning, keep max 8 colors
      return [color, ...filtered].slice(0, 8);
    });
  }, []);


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
    
    // Add color to recent colors if color is being updated
    if (updates.color) {
      addToRecentColors(updates.color);
    }
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
      
      // AI 추천이 있다면 추천 설명을 포함한 설명 생성
      let fullDescription = description;
      if (aiRecommendation?.reasoning) {
        fullDescription = description 
          ? `${description}\n\n[AI 추천 근거] ${aiRecommendation.reasoning}`
          : `[AI 추천 근거] ${aiRecommendation.reasoning}`;
      }
      
      const result = await generateCmfDesign(uploadedFiles, materials, colors, fullDescription);
      setGeneratedImages(result.images);
      
      // AI 추천이 있다면 추천 설명을 디자인 분석에 포함
      let enhancedExplanation = result.explanation;
      if (aiRecommendation?.reasoning) {
        enhancedExplanation = `🎨 AI 추천 분석\n${aiRecommendation.reasoning}\n\n📊 디자인 생성 결과\n${result.explanation}`;
      }
      setDesignExplanation(enhancedExplanation);
      
    } catch (err) {
      console.error(err);
      let errorMessage = 'An unknown error occurred. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('Timeout')) {
          errorMessage = '처리 시간이 너무 오래 걸립니다. 이미지 크기를 줄이거나 더 간단한 설정으로 다시 시도해주세요.';
        } else if (err.message.includes('API_KEY')) {
          errorMessage = 'AI 서비스 설정에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
        } else if (err.message.includes('failed to fetch') || err.message.includes('network')) {
          errorMessage = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
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
    setProductName('');
    setProductPurpose('');
    setFinishEnabled(false);
    setDescriptionEnabled(false);
    setAiRecommendation(null);
    setShowRecommendationBanner(false);
    setIsRecommendationApplied(false);
    setDesignerStep(1);
  };

  // AI 추천 결과 처리 (모달용)
  const handleAIRecommendationModal = (recommendation: AIRecommendation) => {
    setAiRecommendation(recommendation);
    setShowRecommendationBanner(true);
    setIsRecommendationApplied(false); // 새로운 추천 받으면 적용 상태 초기화
    
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
      // 추천 적용 완료 상태 설정
      setIsRecommendationApplied(true);
      // 추천을 적용했지만 배너는 유지 (추천 내용을 계속 볼 수 있도록)
      // setShowRecommendationBanner(false);
    }
  };

  // AI 추천 무시
  const dismissAIRecommendation = () => {
    setShowRecommendationBanner(false);
  };

  // AI 추천 처리
  const handleAIRecommendation = async () => {
    if (!productName || !productPurpose) {
      alert('제품 정보를 모두 입력해주세요 (제품명, 타겟/목적)');
      return;
    }

    setIsAIRecommending(true);
    try {
      // 업로드된 이미지 파일들 가져오기
      const uploadedFiles = originalImages
        .map(img => img.file)
        .filter((file): file is File => file !== null);

      const recommendation = await getAIRecommendation(
        productName,
        productPurpose,
        uploadedFiles.length > 0 ? uploadedFiles : undefined
      );

      // 추천 결과 적용
      if (materialColorSets.length > 0) {
        updateMaterialColorSet(materialColorSets[0].id, {
          material: recommendation.material,
          color: recommendation.color,
          enabled: true
        });
      }
      
      setFinish(recommendation.finish);
      setFinishEnabled(true);

      // 추천 결과 모달로 표시
      setAiRecommendation({
        material: recommendation.material,
        color: recommendation.color,
        finish: recommendation.finish,
        description: '',
        reasoning: recommendation.reasoning
      });
      setShowRecommendationBanner(true);
      setIsRecommendationApplied(false); // 새로운 추천 받으면 적용 상태 초기화

    } catch (error) {
      console.error('AI 추천 오류:', error);
      alert('추천 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsAIRecommending(false);
    }
  };


  const isReadyToGenerate = originalImages.some(img => img.file !== null);
  const showResults = (generatedImages.length > 0) && !isLoading;
  
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
              <h2 className="text-3xl font-semibold text-indigo-900">
                으로 스마트하고 빠르게<br />
                아이디어를 완성하세요
              </h2>
              <p className="text-xl text-indigo-800 max-w-2xl mx-auto">
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
                                productName={productName}
                                onProductNameChange={setProductName}
                                productPurpose={productPurpose}
                                onProductPurposeChange={setProductPurpose}
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
                                    disabled={isRecommendationApplied}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                                        isRecommendationApplied
                                            ? 'bg-green-600 text-white cursor-default'
                                            : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {isRecommendationApplied ? '적용됨' : '추천 적용하기'}
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
                                recentColors={recentColors}
                                onGenerate={handleGenerate}
                                isLoading={isLoading}
                                isReady={isReadyToGenerate}
                                isLimitReached={false}
                                finishEnabled={finishEnabled}
                                setFinishEnabled={setFinishEnabled}
                                descriptionEnabled={descriptionEnabled}
                                setDescriptionEnabled={setDescriptionEnabled}
                                onAIRecommendation={handleAIRecommendation}
                                isAIRecommending={isAIRecommending}
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
                    <p className="text-sm text-gray-500">이미지 처리와 AI 생성에 2-5분 정도 소요됩니다.</p>
                    <p className="text-xs text-gray-400 mt-2">네트워크 상태에 따라 시간이 더 걸릴 수 있습니다.</p>
                </div>
                )}
                
                {showResults && (
                <>
                    <ResultDisplay generatedImageUrls={generatedImages} />
                    
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
            onRecommendation={handleAIRecommendationModal}
        />

      </main>
      <footer className="text-center py-6 text-indigo-800 text-sm relative z-10">
        <p>Gemini API 제공</p>
      </footer>
    </div>
  );
};

export default App;
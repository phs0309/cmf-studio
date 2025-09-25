import React, { useState, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { Controls } from './Controls';
import { ResultDisplay } from './ResultDisplay';
import { Loader } from './Loader';
import { AIRecommendationModal, AIRecommendation } from './AIRecommendationModal';
import { generateCmfDesign } from '../services/geminiService';
import { getAIRecommendation } from '../src/services/aiRecommendationService';
import { MATERIALS, FINISHES, MATERIAL_NAMES, MaterialColorSet } from '../constants';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface BlueprintToCMFProps {
  onNavigateHome: () => void;
}

export const BlueprintToCMF: React.FC<BlueprintToCMFProps> = ({ onNavigateHome }) => {
  // Image states
  const [originalImages, setOriginalImages] = useState<Array<{ file: File | null; previewUrl: string | null }>>(
    Array.from({ length: 3 }, () => ({ file: null, previewUrl: null }))
  );
  const [imageDescription, setImageDescription] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [productPurpose, setProductPurpose] = useState<string>('');
  const [productTarget, setProductTarget] = useState<string>('');
  
  // CMF states
  const [materialColorSets, setMaterialColorSets] = useState<MaterialColorSet[]>([
    { id: '1', material: MATERIALS[0].name, color: '#007aff', enabled: true }
  ]);
  const [finish, setFinish] = useState<string>(FINISHES[0]);
  const [description, setDescription] = useState<string>('');
  
  // Result states
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [designExplanation, setDesignExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toggle states
  const [finishEnabled, setFinishEnabled] = useState<boolean>(false);
  const [descriptionEnabled, setDescriptionEnabled] = useState<boolean>(false);
  
  // AI Recommendation states
  const [isAIRecommending, setIsAIRecommending] = useState<boolean>(false);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [showRecommendationBanner, setShowRecommendationBanner] = useState<boolean>(false);
  const [isRecommendationApplied, setIsRecommendationApplied] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  
  // Recent colors state
  const [recentColors, setRecentColors] = useState<string[]>([]);

  const handleImagesUpload = (files: File[]) => {
    const newImages = [...originalImages];
    let addedCount = 0;
    
    files.forEach((file) => {
      const emptyIndex = newImages.findIndex(img => img.file === null);
      if (emptyIndex !== -1 && addedCount < 3) {
        const previewUrl = URL.createObjectURL(file);
        newImages[emptyIndex] = { file, previewUrl };
        addedCount++;
      }
    });
    
    setOriginalImages(newImages);
    setGeneratedImages([]);
    setDesignExplanation('');
    setError(null);
  };

  const handleExampleImageSelect = async (imagePath: string) => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const fileName = imagePath.split('/').pop() || 'blueprint.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      
      // Pre-fill product information for iron example
      if (imagePath.includes('iron-sketch')) {
        setProductName('다리미');
        setProductPurpose('20~30대 1인가구 젊은 여성, 가볍고 미니멀한 디자인 추구');
      }
      
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
    setDesignExplanation('');
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
  
  // Add color to recent colors
  const addToRecentColors = (color: string) => {
    setRecentColors(prev => {
      // Remove color if it already exists
      const filtered = prev.filter(c => c.toLowerCase() !== color.toLowerCase());
      // Add to beginning, keep max 8 colors
      return [color, ...filtered].slice(0, 8);
    });
  };

  // New unified AI recommendation handler
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

      // 추천 결과 배너로 표시
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
    }
  };

  // AI 추천 무시
  const dismissAIRecommendation = () => {
    setShowRecommendationBanner(false);
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

  // Original individual AI recommendation handlers (kept for backwards compatibility)
  const handleAIRecommendMaterial = async (setId: string) => {
    if (!productName || !productPurpose || !productTarget) {
      alert('제품 정보를 모두 입력해주세요 (제품명, 용도, 타겟 사용자)');
      return;
    }

    // 설계도 기반 제품의 소재 추천 로직
    let blueprintMaterials = MATERIALS;
    
    if (productPurpose.includes('구조') || productPurpose.includes('프레임')) {
      blueprintMaterials = MATERIALS.filter(m => 
        m.name.includes('Metal') || m.name.includes('Steel') || m.name.includes('Aluminum')
      );
    } else if (productPurpose.includes('외장') || productPurpose.includes('케이스')) {
      blueprintMaterials = MATERIALS.filter(m => 
        m.name.includes('Plastic') || m.name.includes('ABS') || m.name.includes('PC')
      );
    } else if (productPurpose.includes('고성능') || productPurpose.includes('전문')) {
      blueprintMaterials = MATERIALS.filter(m => 
        m.name.includes('Carbon') || m.name.includes('Titanium') || m.name.includes('Ceramic')
      );
    }
    
    if (blueprintMaterials.length === 0) {
      blueprintMaterials = MATERIALS.filter(m => 
        m.name.includes('Metal') || m.name.includes('Plastic') || m.name.includes('Carbon')
      );
    }
    
    const randomMaterial = blueprintMaterials[Math.floor(Math.random() * blueprintMaterials.length)];
    
    updateMaterialColorSet(setId, { 
      material: randomMaterial?.name || MATERIALS[0].name,
      enabled: true 
    });
    
    alert(`🎨 AI 추천: ${randomMaterial?.name}\n\n${productName} 설계도를 ${productPurpose} 목적으로 구현하기 위한 ${productTarget} 맞춤 소재입니다. 제조 효율성과 내구성을 고려했습니다.`);
  };

  const handleAIRecommendColor = async (setId: string) => {
    if (!productName || !productPurpose || !productTarget) {
      alert('제품 정보를 모두 입력해주세요 (제품명, 용도, 타겟 사용자)');
      return;
    }

    // 설계도 기반 제품의 색상 추천
    let colorPalette: string[] = [];
    let colorReason = '';
    
    // 공업/기술 제품 특성에 맞는 색상 선택
    if (productPurpose.includes('산업') || productPurpose.includes('공업')) {
      colorPalette = ['#2C3E50', '#34495E', '#7F8C8D', '#E67E22']; // 산업용 색상
      colorReason = '산업용 제품에 적합한 안전하고 전문적인 색상';
    } else if (productPurpose.includes('의료') || productPurpose.includes('헬스케어')) {
      colorPalette = ['#ECF0F1', '#BDC3C7', '#3498DB', '#27AE60']; // 의료용 색상
      colorReason = '의료용 제품의 청결함과 신뢰성을 표현하는 색상';
    } else if (productPurpose.includes('전자') || productPurpose.includes('IT')) {
      colorPalette = ['#2C3E50', '#9B59B6', '#3498DB', '#95A5A6']; // 전자제품 색상
      colorReason = '전자제품의 첨단 기술감을 강조하는 색상';
    } else {
      // 기본 전문적 색상
      colorPalette = ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1', '#E74C3C', '#3498DB'];
      colorReason = '전문적이고 실용적인 범용 색상';
    }
    
    const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    
    updateMaterialColorSet(setId, { 
      color: randomColor,
      enabled: true 
    });
    
    alert(`🎨 AI 추천 색상: ${randomColor}\n\n${productName} 설계도 구현을 위한 ${colorReason}입니다. ${productTarget}의 ${productPurpose} 요구사항에 최적화되었습니다.`);
  };

  const handleAIRecommendFinish = async () => {
    if (!productName || !productPurpose || !productTarget) {
      alert('제품 정보를 모두 입력해주세요 (제품명, 용도, 타겟 사용자)');
      return;
    }

    // 설계도 기반 제품의 마감 추천
    let recommendedFinish = '';
    let finishReason = '';
    
    if (productPurpose.includes('산업') || productPurpose.includes('공업')) {
      recommendedFinish = 'Textured';
      finishReason = '산업용 제품의 안전한 그립감과 내구성을 위한 텍스처 마감';
    } else if (productPurpose.includes('정밀') || productPurpose.includes('의료')) {
      recommendedFinish = 'Satin';
      finishReason = '정밀 제품의 청결함과 전문성을 표현하는 새틴 마감';
    } else if (productPurpose.includes('전자') || productPurpose.includes('IT')) {
      recommendedFinish = 'Brushed';
      finishReason = '전자제품의 첨단 기술감을 강조하는 브러시 마감';
    } else if (productPurpose.includes('구조') || productPurpose.includes('프레임')) {
      recommendedFinish = 'Matte';
      finishReason = '구조물의 실용성과 견고함을 표현하는 무광 마감';
    } else {
      const functionalFinishes = ['Matte', 'Brushed', 'Textured'];
      recommendedFinish = functionalFinishes[Math.floor(Math.random() * functionalFinishes.length)];
      finishReason = '설계도 기반 제품에 적합한 기능적 마감';
    }
    
    setFinish(recommendedFinish);
    setFinishEnabled(true);
    
    alert(`🎨 AI 추천 마감: ${recommendedFinish}\n\n${productName} 설계도 구현을 위한 ${finishReason}입니다. ${productTarget}의 ${productPurpose} 요구사항에 최적화되었습니다.`);
  };

  const handleGenerate = useCallback(async () => {
    const uploadedFiles = originalImages.map(img => img.file).filter((file): file is File => file !== null);

    if (uploadedFiles.length === 0) {
      setError('설계도 이미지를 업로드해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setDesignExplanation('');

    try {
      const enabledSets = materialColorSets.filter(set => set.enabled);
      const materials = enabledSets.map(set => set.material);
      const colors = enabledSets.map(set => set.color);
      
      // Enhanced prompt for blueprint to CMF conversion with AI recommendation
      let fullDescription = `Convert this blueprint/technical drawing into a realistic 3D rendered CMF design. Remove any pencil marks, sketch lines, or drawing artifacts. Create a clean, professional 3D product visualization with photorealistic materials and lighting. Apply the specified materials and colors to create a high-quality product rendering that looks like a finished consumer product. ${description}`;
      if (aiRecommendation?.reasoning) {
        fullDescription = fullDescription + (description 
          ? `\n\n[AI 추천 근거] ${aiRecommendation.reasoning}`
          : `\n\n[AI 추천 근거] ${aiRecommendation.reasoning}`);
      }
      
      const result = await generateCmfDesign(uploadedFiles, materials, colors, fullDescription);
      setGeneratedImages(result.images);
      
      // AI 추천이 있다면 추천 설명을 디자인 분석에 포함
      let enhancedExplanation = result.explanation;
      if (aiRecommendation?.reasoning) {
        enhancedExplanation = `🎨 AI 추천 분석\n${aiRecommendation.reasoning}\n\n📊 설계도 변환 결과\n${result.explanation}`;
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

  const handleReset = () => {
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
    setProductTarget('');
    setFinishEnabled(false);
    setDescriptionEnabled(false);
    setAiRecommendation(null);
    setShowRecommendationBanner(false);
    setIsRecommendationApplied(false);
  };

  const isReadyToGenerate = originalImages.some(img => img.file !== null);
  const showResults = (generatedImages.length > 0) && !isLoading;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors mb-4"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          홈으로 돌아가기
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">설계도를 CMF Design으로</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          기술 도면이나 설계도를 실제 제품 비주얼로 변환하고<br />
          원하는 색상, 소재, 마감을 적용해보세요
        </p>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-6 bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-pink-300/70">
        <h2 className="text-2xl font-semibold text-gray-900">1. 설계도 업로드</h2>
        <div className="space-y-4">
          <p className="text-base text-gray-600">기술 도면, CAD 파일, 스케치 등을 업로드해주세요 (최대 3개).</p>
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
            productTarget={productTarget}
            onProductTargetChange={setProductTarget}
          />
        </div>
      </div>

      {/* AI 추천 배너 */}
      {showRecommendationBanner && aiRecommendation && (
        <div className="space-y-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-6 rounded-2xl shadow-lg">
          {/* 제목과 닫기 버튼 */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-purple-900">🎨 AI 디자인 추천</h3>
            <button
              onClick={dismissAIRecommendation}
              className="text-purple-400 hover:text-purple-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 추천 정보 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/60 p-4 rounded-xl">
              <div className="text-sm font-semibold text-purple-800 mb-2">추천 소재</div>
              <div className="text-base font-medium text-purple-900">{aiRecommendation.material}</div>
            </div>
            <div className="bg-white/60 p-4 rounded-xl">
              <div className="text-sm font-semibold text-purple-800 mb-2">추천 색상</div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{backgroundColor: aiRecommendation.color}}></span>
                <span className="text-base font-medium text-purple-900">{aiRecommendation.color}</span>
              </div>
            </div>
            <div className="bg-white/60 p-4 rounded-xl">
              <div className="text-sm font-semibold text-purple-800 mb-2">추천 마감</div>
              <div className="text-base font-medium text-purple-900">{aiRecommendation.finish}</div>
            </div>
          </div>

          {/* 상세 설명 */}
          <div className="bg-white/70 p-5 rounded-xl">
            <div className="text-sm font-semibold text-purple-800 mb-3">💡 추천 근거</div>
            <div className="text-base text-purple-900 leading-relaxed whitespace-pre-line">
              {aiRecommendation.reasoning}
            </div>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">2. CMF 디자인 설정</h2>
            <p className="text-sm text-gray-600">실제 제품으로 구현할 소재, 색상, 마감을 설정하세요</p>
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
            recentColors={recentColors}
            onAIRecommendation={handleAIRecommendation}
            isAIRecommending={isAIRecommending}
            onAIRecommendMaterial={handleAIRecommendMaterial}
            onAIRecommendColor={handleAIRecommendColor}
            onAIRecommendFinish={handleAIRecommendFinish}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-16 flex flex-col items-center justify-center">
          <Loader />
          <p className="mt-4 text-lg text-gray-700">설계도를 실제 제품으로 변환 중입니다...</p>
          <p className="text-sm text-gray-500">AI 처리에 2-5분 정도 소요됩니다.</p>
          <p className="text-xs text-gray-400 mt-2">복잡한 설계도는 처리 시간이 더 걸릴 수 있습니다.</p>
        </div>
      )}
      
      {showResults && (
        <>
          <ResultDisplay generatedImageUrls={generatedImages} />
          
          {/* Design Explanation */}
          {designExplanation && generatedImages.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  🎨 설계도 변환 분석
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
            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="text-gray-700 bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 focus:ring-4 focus:ring-purple-200 font-bold rounded-xl text-base px-6 py-3 text-center transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                다시 하기
              </button>
            </div>
          )}
        </>
      )}

      {/* AI 추천 모달 */}
      <AIRecommendationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onRecommendation={handleAIRecommendationModal}
      />
    </div>
  );
};